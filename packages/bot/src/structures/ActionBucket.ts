import { Collection } from '@discordjs/collection'
import {
  FileBuilder,
  MessageBuilder,
  MessageTypes,
  parseToMessageBuilder
} from '@jadl/builders'
import { Cache } from '@jpbberry/cache'

import {
  AllowedMentionsTypes,
  APIGuildMember,
  APIWebhook,
  APIUser,
  Snowflake,
  WebhookType
} from 'discord-api-types/v9'

import { GuildDB } from '@censorbot/typings'

import { WorkerManager } from '../managers/Worker'

import { wait } from '@censorbot/utils'
import { DiscordAPIError } from '@discordjs/rest'

interface DeleteBucket {
  msgs: Snowflake[]
  amount: number
  running: boolean
  timeout?: NodeJS.Timeout
}

interface ResendCache {
  id: Snowflake
  channelId: Snowflake
}

export class ActionBucket {
  messages: Collection<Snowflake, DeleteBucket> = new Collection()
  popups: Collection<string, true> = new Collection()
  webhooks: Cache<Snowflake, APIWebhook> = new Cache(30e3)
  resends: Collection<Snowflake, Cache<Snowflake, Array<ResendCache>>> =
    new Collection()

  constructor(public worker: WorkerManager) {}

  public async delete(channel: Snowflake, message: Snowflake[]): Promise<void> {
    let bucket = this.messages.get(channel)
    if (!bucket) {
      bucket = {
        msgs: [],
        running: false,
        amount: 0
      }
    } else {
      clearTimeout(bucket.timeout as unknown as number)
    }

    if (bucket.amount <= this.worker.config.actionRetention) {
      this.worker.requests.bulkDeleteMessages(channel, message).catch(() => {})

      bucket.amount++
      bucket.timeout = setTimeout(() => {
        this.messages.delete(channel)
      }, 15000)

      return void this.messages.set(channel, bucket)
    }

    if (Array.isArray(message)) {
      bucket.msgs.push(...message)
    } else bucket.msgs.push(message)

    if (bucket.running) {
      this.messages.set(channel, bucket)

      return
    }

    bucket.running = true
    this.messages.set(channel, bucket)

    setTimeout(() => {
      this._executeDelete(channel)
    }, 4000)
  }

  private _executeDelete(channel: Snowflake): void {
    const bucket = this.messages.get(channel)
    if (!bucket) return
    this.messages.delete(channel)

    this.worker.requests
      .bulkDeleteMessages(channel, bucket.msgs)
      .catch(() => {})
  }

  public popup(channel: Snowflake, user: Snowflake, db: GuildDB): void {
    const id = `${channel}-${user}`
    if (this.popups.has(id)) return

    this.popups.set(id, true)

    this.worker.responses
      .popup(
        channel,
        user,
        db.response.content === null
          ? this.worker.config.defaultMessage
          : (db.response.content as string),
        db.response.dm
      )
      .then(async (msg) => {
        if (!db.response.deleteAfter || db.response.dm) {
          await wait(5000)
          return this.popups.delete(id)
        }
        await wait(db.response.deleteAfter)
        this.worker.requests.deleteMessage(channel, msg.id).catch(console.log)
        this.popups.delete(id)
      })
      .catch(() => {})
  }

  WEBHOOK_NAME = 'Censor Bot Resend Webhook'

  public async sendAs(
    channelId: Snowflake,
    guildId: Snowflake,
    member: APIGuildMember & { user: APIUser },
    name: string,
    messageInfo: MessageTypes
  ): Promise<void> {
    if (!this.worker.hasPerms(guildId, 'webhooks', channelId)) return

    let webhook = this.webhooks.get(channelId)
    if (!webhook) {
      webhook = await this.worker.requests
        .createWebhook(channelId, {
          name: this.WEBHOOK_NAME
        })
        .catch(async (err: DiscordAPIError) => {
          // 30007 = Maximum number of webhooks reached (10)
          if (err.code === 30007) {
            const webhooks = await this.worker.requests.getWebhooks(channelId)
            const cbWebhooks = webhooks.filter(
              (x) =>
                x.type === WebhookType.Incoming && x.name === this.WEBHOOK_NAME
            )

            const newWebhook = cbWebhooks.pop()

            if (!newWebhook) return undefined

            await Promise.all(
              cbWebhooks.map((wh) =>
                this.worker.requests.deleteWebhook(wh.id, wh.token!)
              )
            )

            return newWebhook
          } else return undefined
        })

      if (!webhook) return

      this.webhooks.set(channelId, webhook, () => {
        if (!webhook) {
          return {}
        }
        void this.worker.requests.deleteWebhook(webhook.id, webhook.token)
        return {}
      })
    }

    const avatarUrl = member.avatar
      ? this.worker.api.cdn.guildMemberAvatar(
          guildId,
          member.user.id,
          member.avatar
        )
      : member.user.avatar
      ? this.worker.api.cdn.avatar(member.user.id, member.user.avatar)
      : this.worker.api.cdn.defaultAvatar(Number(member.user.discriminator) % 5)

    const extra = {
      username: name,
      avatar_url: avatarUrl,
      allowed_mentions: {
        parse: [AllowedMentionsTypes.User]
      }
    }

    if (messageInfo instanceof FileBuilder) {
      const builder = new MessageBuilder()
        .addFiles(messageInfo)
        .setMessage({ ...extra })

      messageInfo = builder
    } else if (messageInfo instanceof MessageBuilder) {
      messageInfo.message = {
        ...extra,
        content:
          messageInfo.message.content?.slice(0, 1998) +
          ((messageInfo.message.content?.length || 0) > 1998 &&
          messageInfo.message.content?.endsWith('||')
            ? '||'
            : '')
      }
    }

    const responseMessage = await this.worker.requests.sendWebhookMessage(
      webhook.id,
      webhook.token as string,
      messageInfo
    )

    let guild = this.resends.get(guildId)
    if (!guild) {
      guild = new Cache(1.8e6)

      this.resends.set(guildId, guild)
    }

    let user = guild.get(member.user.id)
    if (!user) {
      user = []
      guild.set(member.user.id, user, () => {
        if (guild!.size < 1) this.resends.delete(guildId)

        return {}
      })
    }

    user.push({
      id: responseMessage.id,
      channelId
    })
  }
}
