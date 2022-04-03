import {
  FilterResultInfo,
  FilterType,
  CensorMethods,
  ExceptionType,
  GuildDB,
  WebhookReplace,
  Plugin
} from 'typings'

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
import { FileBuilder } from '@jadl/cmd'
import { isBitOn } from '../utils/bit'

interface MultiLine {
  author: Snowflake
  messages: {
    [key: Snowflake]: ContentData
  }
}

interface ContentData {
  id: Snowflake
  content?: string
  images: string[]
}

const replaces = {
  [WebhookReplace.Hashtags]: '#',
  [WebhookReplace.Stars]: '*'
}

class ContentData implements ContentData {
  content?: string
  id: string
  images: string[] = []

  constructor(message: DiscordEventMap['MESSAGE_CREATE' | 'MESSAGE_UPDATE']) {
    this.id = message.id

    this.setContent(message.content)
      .addImages(message.attachments?.map((x) => x.proxy_url))
      .addImages(
        message.embeds
          ?.map((x) => x.thumbnail?.proxy_url)
          .filter((x) => x) as string[]
      )
  }

  addImages(images?: string[]) {
    if (images) this.images.push(...images)

    return this
  }

  setContent(content?: string) {
    this.content = content

    return this
  }
}

interface OcrInfo {
  url: string
  lines: OcrLine[]
}

export class MessageFilterContext {
  content?: string

  contentData: ContentData
  ocr: OcrInfo[] = []
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

  addOcrInfo(ocrInfo: OcrInfo) {
    this.ocr.push(ocrInfo)

    return this
  }

  setResponse(response: FilterResultInfo) {
    this.response = response

    return this
  }
}

export class MessagesFilterHandler extends BaseFilterHandler {
  multiLineStore: Cache<Snowflake, MultiLine> = new Cache(3.6e6)

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
      channel.type !== ChannelType.GuildText ||
      this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        roles: message.member.roles,
        channel: message.channel_id
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
        channel: message.channel_id,
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
      for (const url of contentData.contentData.images) {
        const res = await this.worker.images.test(url)
        if (res.bad) {
          contentData
            .setContent(
              `${message.content ?? 'No message content'} + [image](${url})`
            )
            .setResponse({
              type: FilterType.Images,
              percentage: res.percent
            })
        }
        continue
      }

      if (contentData.response)
        return await this.handleDeletion(contentData, db)
    }

    if (isBitOn(db.plugins, Plugin.OCR)) {
      for (const url of contentData.contentData.images) {
        const scanned = await this.worker.ocr.resolve(url)
        if (scanned) {
          const current: OcrInfo = { url, lines: [] }
          for (const scan of scanned.ParsedResults?.[0]?.TextOverlay?.Lines ??
            []) {
            const test = this.test(scan.LineText, db, {
              roles: message.member.roles,
              channel: message.channel_id
            })
            if (test) {
              current.lines.push(scan)
              contentData.setResponse({ ...test })
            }
          }
          contentData.addOcrInfo(current)
        }
      }
    }

    if (!isBitOn(db.censor, CensorMethods.Messages)) return

    if (contentData.content && isBitOn(db.censor, CensorMethods.Messages)) {
      const response = this.test(contentData.content, db, {
        roles: message.member.roles,
        channel: message.channel_id
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

        const messageToSend = contentData.ocr.length
          ? new FileBuilder().extra({ content })
          : {
              content
            }

        if (messageToSend instanceof FileBuilder) {
          for (const ocr of contentData.ocr) {
            messageToSend.add(
              'resend.png',
              await this.worker.ocr.cover(ocr.url, ocr.lines)
            )
          }
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
