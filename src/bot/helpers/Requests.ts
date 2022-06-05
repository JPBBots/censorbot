/* eslint-disable @typescript-eslint/promise-function-async */

import types, {
  Snowflake,
  Routes,
  RESTGetAPIChannelMessagesQuery
} from 'discord-api-types/v9'

import { MessageTypes, formatMessage, SendMessageType } from '@jadl/cmd'

import { REST, RequestData } from '@discordjs/rest'
import { Cache } from '@jpbberry/cache'

export type Emoji = string | Snowflake

export class Requests {
  constructor(private readonly api: REST) {}

  dmCache: Cache<Snowflake, types.RESTPostAPICurrentUserCreateDMChannelResult> =
    new Cache(60e3)

  editMember(
    guildId: Snowflake,
    userId: Snowflake,
    member: types.RESTPatchAPIGuildMemberJSONBody & {
      communication_disabled_until?: string
    },
    extra?: RequestData
  ): Promise<types.RESTPatchAPIGuildMemberResult> {
    return this.api.patch(Routes.guildMember(guildId, userId), {
      body: member,
      ...extra
    }) as any
  }

  setNickname(guildId: Snowflake, userId: Snowflake, nickname: string | null) {
    return this.editMember(guildId, userId, { nick: nickname })
  }

  addRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTPutAPIGuildMemberRoleResult> {
    return this.api.put(
      Routes.guildMemberRole(guildId, userId, roleId),
      extra
    ) as any
  }

  getMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTGetAPIGuildMemberResult> {
    return this.api.get(Routes.guildMember(guildId, userId), extra) as any
  }

  sendMessage(
    channelId: Snowflake,
    message: MessageTypes,
    extra?: RequestData
  ): Promise<types.RESTPostAPIChannelMessageResult> {
    const msg = formatMessage(message)
    return this.api.post(Routes.channelMessages(channelId), {
      body:
        msg.type === SendMessageType.JSON ? JSON.stringify(msg.data) : msg.data,
      passThroughBody: true,
      headers:
        msg.type === SendMessageType.FormData
          ? msg.data.getHeaders()
          : { 'Content-Type': 'application/json' },
      ...extra
    }) as any
  }

  deleteMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIChannelMessageResult> {
    return this.api.delete(
      Routes.channelMessage(channelId, messageId),
      extra
    ) as any
  }

  bulkDeleteMessages(
    channelId: Snowflake,
    messageIds: Snowflake[]
  ): Promise<types.RESTPostAPIChannelMessagesBulkDeleteResult> {
    if (messageIds.length < 2)
      return this.deleteMessage(channelId, messageIds[0])

    return this.api.post(Routes.channelBulkDelete(channelId), {
      body: {
        messages: messageIds
      }
    }) as any
  }

  removeRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIGuildMemberRoleResult> {
    return this.api.delete(
      Routes.guildMemberRole(guildId, userId, roleId),
      extra
    ) as any
  }

  kickMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIGuildMemberResult> {
    return this.api.delete(Routes.guildMember(guildId, userId), extra) as any
  }

  banMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTPutAPIGuildBanResult> {
    return this.api.put(Routes.guildBan(guildId, userId), extra) as any
  }

  unbanMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIGuildBanResult> {
    return this.api.delete(Routes.guildBan(guildId, userId), extra) as any
  }

  async createDM(
    userId: Snowflake
  ): Promise<types.RESTPostAPICurrentUserCreateDMChannelResult> {
    if (this.dmCache.has(userId)) return this.dmCache.get(userId) as any

    const channel = (await this.api.post(Routes.userChannels(), {
      body: {
        recipient_id: userId
      }
    })) as types.RESTPostAPICurrentUserCreateDMChannelResult
    this.dmCache.set(userId, channel)

    return channel
  }

  async dm(userId: Snowflake, message: MessageTypes) {
    const channel = await this.createDM(userId)

    return await this.sendMessage(channel.id, message)
  }

  leaveGuild(
    guildId: Snowflake
  ): Promise<types.RESTDeleteAPICurrentUserGuildResult> {
    return this.api.delete(Routes.userGuild(guildId)) as any
  }

  deleteWebhookMessage(
    webhookId: Snowflake,
    webhookToken: string,
    messageId: Snowflake
  ): Promise<types.RESTDeleteAPIChannelMessageUserReactionResult> {
    return this.api.delete(
      Routes.webhookMessage(webhookId, webhookToken, messageId)
    ) as any
  }

  private _parseEmoji(emoji: Emoji): string {
    if (emoji.match(/^[0-9]+$/)) return `unknown:${emoji}`
    return encodeURIComponent(emoji)
  }

  react(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: Emoji
  ): Promise<types.RESTPutAPIChannelMessageReactionResult> {
    return this.api.put(
      Routes.channelMessageOwnReaction(
        channelId,
        messageId,
        this._parseEmoji(emoji)
      )
    ) as any
  }

  deleteAllReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: Emoji,
    user?: Snowflake | '@me'
  ): Promise<types.RESTDeleteAPIChannelMessageReactionResult> {
    return this.api.delete(
      `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(
        emoji
      )}${user ? `/${user}` : ''}`
    ) as any
  }

  createWebhook(
    channelId: Snowflake,
    data: types.RESTPostAPIChannelWebhookJSONBody
  ): Promise<types.RESTPostAPIChannelWebhookResult> {
    return this.api.post(Routes.channelWebhooks(channelId), {
      body: data
    }) as any
  }

  deleteWebhook(
    webhookId: Snowflake,
    token?: string
  ): Promise<types.RESTDeleteAPIWebhookWithTokenResult> {
    return this.api.delete(
      `/webhooks/${webhookId}${token ? `/${token}` : ''}`
    ) as any
  }

  sendWebhookMessage(
    webhookId: Snowflake,
    webhookToken: string,
    message: MessageTypes
  ): Promise<types.RESTPostAPIWebhookWithTokenWaitResult> {
    const msg = formatMessage(message)
    return this.api.post(Routes.webhook(webhookId, webhookToken), {
      query: new URLSearchParams({ wait: 'true' }),
      body:
        msg.type === SendMessageType.JSON ? JSON.stringify(msg.data) : msg.data,
      headers:
        msg.type === SendMessageType.FormData
          ? msg.data.getHeaders()
          : { 'Content-Type': 'application/json' },
      passThroughBody: true
    }) as any
  }

  getWebhooks(
    channelId: Snowflake
  ): Promise<types.RESTGetAPIChannelWebhooksResult> {
    return this.api.get(Routes.channelWebhooks(channelId)) as any
  }

  getUserGuilds(
    token: string
  ): Promise<types.RESTGetAPICurrentUserGuildsResult> {
    return this.api.get(Routes.userGuilds(), {
      headers: {
        Authorization: `Bearer ${token}`
      },
      auth: false
    }) as any
  }

  getSelf(token: string): Promise<types.RESTGetAPICurrentUserResult> {
    return this.api.get(Routes.user(), {
      headers: {
        Authorization: `Bearer ${token}`
      },
      auth: false
    }) as any
  }

  authorizeToken(
    request: types.RESTPostOAuth2AccessTokenURLEncodedData
  ): Promise<types.RESTPostOAuth2AccessTokenResult> {
    return this.api.post(Routes.oauth2TokenExchange(), {
      body: new URLSearchParams(request as any),
      auth: false,
      passThroughBody: true
    }) as any
  }

  timeoutMember(
    guildId: Snowflake,
    memberId: Snowflake,
    length: number,
    reason?: string
  ) {
    return this.editMember(
      guildId,
      memberId,
      {
        communication_disabled_until: new Date(
          Date.now() + length
        ).toISOString()
      },
      {
        reason
      }
    )
  }

  getMessages(
    channelId: Snowflake,
    query: RESTGetAPIChannelMessagesQuery = { limit: 100 }
  ): Promise<types.RESTGetAPIChannelMessagesResult> {
    return this.api.get(Routes.channelMessages(channelId), {
      query: new URLSearchParams(query as Record<string, string>)
    }) as any
  }

  editChannel(
    channelId: Snowflake,
    edit: types.RESTPatchAPIChannelJSONBody
  ): Promise<types.RESTPatchAPIChannelResult> {
    return this.api.patch(Routes.channel(channelId), {
      body: edit
    }) as any
  }
}
