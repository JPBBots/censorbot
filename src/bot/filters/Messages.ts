import {
  FilterResultInfo,
  FilterType,
  CensorMethods,
  ExceptionType,
  GuildDB,
  WebhookReplace,
  Plugin
} from '@censorbot/typings'

import {
  Snowflake,
  MessageType,
  ChannelType,
  APIUser,
  APIGuildMember
} from 'discord-api-types/v9'

import { Cache } from '@jpbberry/cache'
import { OcrLine } from '../structures/extensions/Ocr'

import { Event } from '@jpbberry/typed-emitter'
import { BaseFilterHandler } from './Base'
import { DiscordEventMap } from 'jadl'
import { SnowflakeUtil } from '../utils/Snowflake'
import { FileBuilder, MessageTypes } from '@jadl/cmd'
import { isBitOn } from '../utils/bit'

import { request } from 'undici'
import { APIAttachment, APIEmbedThumbnail } from 'discord-api-types/v10'

interface MultiLine {
  author: Snowflake
  messages: {
    [key: Snowflake]: ContentData
  }
}

interface ContentData {
  id: Snowflake
  content?: string
  attachments: AttachmentData[]
}

const replaces = {
  [WebhookReplace.Hashtags]: '#',
  [WebhookReplace.Stars]: '*'
}

interface AttachmentData extends APIAttachment {
  ocr?: OcrLine[]
  remove?: boolean
  image: boolean
}

class ContentData implements ContentData {
  content?: string
  id: string
  attachments: AttachmentData[] = []

  constructor(message: DiscordEventMap['MESSAGE_CREATE' | 'MESSAGE_UPDATE']) {
    this.id = message.id

    this.setContent(message.content)
      .addAttachments(
        message.attachments?.map((x) => ({
          ...x,
          image: !!x.content_type?.match('image') || false
        }))
      )
      .addAttachments(
        message.embeds
          ?.map((x) => x.thumbnail)
          .filter((x) => x)
          .map(this.parseEmbedThumbnail.bind(this))
      )
  }

  private parseEmbedThumbnail(
    thumbnail: APIEmbedThumbnail,
    index: number
  ): AttachmentData {
    return {
      ...thumbnail,
      proxy_url: thumbnail.proxy_url ?? thumbnail.url,
      filename: `embedThumbnail${index}.png`,
      id: `embed.thumbnail.${index}`,
      image: true,
      size: 100
    }
  }

  addAttachments(images?: AttachmentData[]) {
    if (images) this.attachments.push(...images)

    return this
  }

  setContent(content?: string) {
    this.content = content

    return this
  }
}

export class MessageFilterContext {
  content?: string

  contentData: ContentData
  response?: FilterResultInfo

  constructor(
    public readonly message: DiscordEventMap[
      | 'MESSAGE_CREATE'
      | 'MESSAGE_UPDATE'] & {
      guild_id: Snowflake
      author: APIUser
      member: APIGuildMember
    }
  ) {
    this.contentData = new ContentData(message)

    this.setContent(message.content)
  }

  setContent(content?: string) {
    if (content) this.content = content

    return this
  }

  setResponse(response: FilterResultInfo) {
    this.response = response

    return this
  }
}

export class MessagesFilterHandler extends BaseFilterHandler {
  multiLineStore: Cache<Snowflake, MultiLine> = new Cache(3.6e6)
  channelTypes = [
    ChannelType.GuildText,
    ChannelType.GuildForum,
    ChannelType.GuildVoice
  ]

  quickMessageUpdateStore: Cache<
    `${Snowflake}-${Snowflake}`,
    DiscordEventMap['MESSAGE_CREATE']
  > = new Cache(30000)

  @Event('MESSAGE_CREATE')
  @Event('MESSAGE_UPDATE')
  async onMessage(
    message: DiscordEventMap['MESSAGE_CREATE' | 'MESSAGE_UPDATE']
  ) {
    const channel =
      this.worker.channels.get(message.channel_id) ??
      (message.guild_id
        ? this.worker.getThreadParent(message.guild_id, message.channel_id)
        : undefined)

    if (!message.author) {
      const newMessage = this.quickMessageUpdateStore.get(
        `${message.channel_id}-${message.id}`
      )
      if (!newMessage) return

      Object.keys(message).forEach((messageKey) => {
        if (message[messageKey]) {
          newMessage[messageKey] = message[messageKey]
        }
      })

      message = newMessage
    } else {
      this.quickMessageUpdateStore.set(
        `${message.channel_id}-${message.id}`,
        message as DiscordEventMap['MESSAGE_CREATE']
      )
    }

    if (!message.guild_id || !message.author || !channel || !message.member)
      return

    if (this.worker.isCustom(message.guild_id)) return

    let multiline = this.multiLineStore.get(message.channel_id)
    if (multiline && multiline.author !== message.author.id) {
      multiline = undefined
      this.multiLineStore.delete(message.channel_id)
    }

    if (message.author.bot) return

    const db = await this.worker.db.config(message.guild_id)

    if (
      ![MessageType.Default, MessageType.Reply].includes(
        message.type as MessageType
      ) ||
      !this.channelTypes.includes(channel.type) ||
      this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        roles: message.member.roles,
        channel: channel.id
      })
    )
      return

    const contentData = new MessageFilterContext(message as any)

    if (isBitOn(db.plugins, Plugin.MultiLine)) {
      if (!multiline) {
        multiline = {
          author: message.author.id,
          messages: {}
        }
      }

      multiline.messages[message.id] = contentData.contentData

      this.multiLineStore.set(message.channel_id, multiline)

      contentData.setContent(
        Object.values(multiline.messages)
          .sort(
            (a, b) =>
              SnowflakeUtil.getTimestamp(a.id).getTime() -
              SnowflakeUtil.getTimestamp(b.id).getTime()
          )
          .map((x) => x.content)
          .join('\n')
      )
    }

    if (
      isBitOn(db.plugins, Plugin.Invites) &&
      !this.worker.isExcepted(ExceptionType.Invites, db.exceptions, {
        channel: channel.id,
        roles: message.member.roles
      })
    ) {
      if (
        contentData.content?.match(
          /discord((app)?\.com\/invite|\.gg)\/([-\w]{2,32})/i
        )
      ) {
        contentData.setResponse({
          type: FilterType.Invites
        })
      }

      if (contentData.response)
        return await this.handleDeletion(contentData, db)
    }

    if (isBitOn(db.plugins, Plugin.Phishing)) {
      if (
        contentData.content &&
        (await this.worker.phishing.resolve(contentData.content))
      ) {
        contentData.setResponse({
          type: FilterType.Phishing
        })
      }

      if (contentData.response)
        return await this.handleDeletion(contentData, db)
    }

    // TODO: Add ExceptionType.NSFW

    if (isBitOn(db.plugins, Plugin.Toxicity) && contentData.content) {
      const prediction = await this.worker.toxicity.test(contentData.content)
      if (prediction.bad) {
        contentData.setResponse({
          type: FilterType.Toxicity,
          percentage: prediction.percent
        })
      }

      if (contentData.response)
        return await this.handleDeletion(contentData, db)
    }

    // NSFW
    if (isBitOn(db.plugins, Plugin.AntiNSFWImages)) {
      for (const attachment of contentData.contentData.attachments.filter(
        (x) => x.image
      )) {
        const res = await this.worker.images.test(attachment.url)
        if (res.bad) {
          contentData
            .setContent(
              `${message.content ?? 'No message content'} + [image](${
                attachment.proxy_url
              })`
            )
            .setResponse({
              type: FilterType.Images,
              percentage: res.percent
            })

          attachment.remove = true
        }
        continue
      }

      if (contentData.response)
        return await this.handleDeletion(contentData, db)
    }

    if (isBitOn(db.plugins, Plugin.Attachments) && message.attachments) {
      for (const attachment of contentData.contentData.attachments) {
        const response = this.test(attachment.filename, db, {
          roles: message.member.roles,
          channel: channel.id
        })

        if (response) {
          contentData
            .setResponse(response)
            .setContent(contentData.content + ' ' + attachment.filename)

          attachment.remove = true

          continue
        }

        if (
          attachment.content_type?.match(/charset=(.+)/)?.[1]?.toLowerCase() ===
          'utf-8'
        ) {
          const { body } = await request(attachment.url)
          const text = await body.text()

          const response = this.test(text.slice(0, 2000), db, {
            roles: message.member.roles,
            channel: channel.id
          })

          if (response) {
            contentData
              .setResponse(response)
              .setContent(contentData.content + ' ' + text)
            attachment.remove = true
          }
        }
      }
    }

    if (isBitOn(db.plugins, Plugin.OCR)) {
      for (const attachment of contentData.contentData.attachments.filter(
        (x) => x.image
      )) {
        const scanned = await this.worker.ocr.resolve(attachment.proxy_url)
        if (scanned) {
          const lines: OcrLine[] = []
          for (const scan of scanned.ParsedResults?.[0]?.TextOverlay?.Lines ??
            []) {
            const test = this.test(scan.LineText, db, {
              roles: message.member.roles,
              channel: channel.id
            })
            if (test) {
              lines.push(scan)
              contentData.setResponse({ ...test })
            }
          }
          attachment.ocr = lines
        }
      }
    }

    if (!isBitOn(db.censor, CensorMethods.Messages)) return

    if (contentData.content && isBitOn(db.censor, CensorMethods.Messages)) {
      const response = this.test(contentData.content, db, {
        roles: message.member.roles,
        channel: channel.id
      })

      if (response) contentData.setResponse(response)
    }

    if (!contentData.response) return

    return await this.handleDeletion(contentData, db)
  }

  async handleDeletion(
    contentData: MessageFilterContext,
    db: GuildDB
  ): Promise<void> {
    const { message } = contentData
    if (
      !this.worker.hasPerms(
        message.guild_id,
        'sendMessages',
        message.channel_id
      )
    )
      return
    if (!this.worker.hasPerms(message.guild_id, 'embed', message.channel_id)) {
      return void this.worker.requests.sendMessage(
        message.channel_id,
        'Missing `Embed Links` permission.'
      )
    }
    if (
      !this.worker.hasPerms(
        message.guild_id,
        'manageMessages',
        message.channel_id
      )
    ) {
      return void this.worker.responses.missingPermissions(
        message.channel_id,
        'Manage Messages'
      )
    }
    const multi = this.multiLineStore.get(message.channel_id)

    void this.worker.actions.delete(
      message.channel_id,
      multi ? Object.values(multi.messages).map((x) => x.id) : [message.id]
    )
    const snipeContent = multi
      ? Object.values(multi.messages)
          .map((x) => x.content)
          .join('\n')
      : contentData.content
    if (snipeContent)
      void this.worker.snipes.set(
        message.channel_id,
        `<@${message.author.id}>: ${snipeContent}`
      )

    if (multi) this.multiLineStore.delete(message.channel_id)

    void this.worker.responses.log(
      CensorMethods.Messages,
      contentData.content ?? 'No Content',
      message,
      contentData.response!,
      db
    )

    if (
      db.response.content !== false &&
      !this.worker.isExcepted(ExceptionType.Response, db.exceptions, {
        roles: message.member.roles,
        channel: message.channel_id
      })
    )
      this.worker.actions.popup(message.channel_id, message.author.id, db)

    if (
      db.resend.enabled &&
      !this.worker.isExcepted(ExceptionType.Resend, db.exceptions, {
        roles: message.member.roles,
        channel: message.channel_id
      }) &&
      (contentData.response?.type === FilterType.BaseFilter ||
        contentData.response?.type === FilterType.ServerFilter)
    ) {
      if (!this.worker.hasPerms(message.guild_id, 'webhooks')) {
        void this.worker.responses.missingPermissions(
          message.channel_id,
          'Manage Webhooks'
        )
      } else {
        let content =
          contentData.content && contentData.response!.ranges.length > 0
            ? this.worker.filter.surround(
                contentData.content,
                contentData.response!.ranges,
                '||'
              )
            : contentData.content

        if (db.resend.replace !== WebhookReplace.Spoilers)
          content = content?.split(/\|\|/g).reduce(
            (a, b) => [
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              a[0] +
                (a[1] === 1 ? replaces[db.resend.replace].repeat(b.length) : b),
              (a[1] as number) * -1
            ],
            ['', -1]
          )[0]

        let messageToSend: MessageTypes = new FileBuilder().extra({ content })

        for (const file of contentData.contentData.attachments) {
          if (file.ocr) {
            messageToSend.add(
              file.filename,
              await this.worker.ocr.cover(file.proxy_url, file.ocr)
            )
          } else if (!file.remove) {
            const buffer = await request(file.proxy_url)
              .then((x) => x.body?.arrayBuffer())
              .then((x) => Buffer.from(x))
              .catch(() => null)
            if (!buffer) continue

            messageToSend.add(file.filename, buffer)
          }
        }

        if (!messageToSend.data.files.length) {
          messageToSend = messageToSend.data.extra || { content }
        }

        void this.worker.actions.sendAs(
          message.channel_id,
          message.guild_id,
          {
            ...message.member,
            user: message.author
          },
          message.member?.nick ?? message.author.username,
          messageToSend
        )
      }
    }

    if (
      !this.worker.isExcepted(ExceptionType.Punishment, db.exceptions, {
        roles: message.member.roles,
        channel: message.channel_id
      }) &&
      isBitOn(db.punishments.allow, contentData.response!.type)
    ) {
      void this.worker.punishments
        .punish(message.guild_id, message.author.id, message.member.roles)
        .catch((err) => {
          void this.worker.responses.missingPermissions(
            message.channel_id,
            err.message
          )
        })
    }
  }
}
