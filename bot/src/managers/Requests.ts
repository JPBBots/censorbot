import types, { Snowflake } from 'discord-api-types'

import { MessageTypes, formatMessage } from '@jadl/cmd'

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
    member: types.RESTPatchAPIGuildMemberJSONBody,
    extra?: RequestData
  ): Promise<types.RESTPatchAPIGuildMemberResult> {
    return this.api.patch(`/guilds/${guildId}/members/${userId}`, {
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
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      extra
    ) as any
  }

  getMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTGetAPIGuildMemberResult> {
    return this.api.get(`/guilds/${guildId}/members/${userId}`, extra) as any
  }

  sendMessage(
    channelId: Snowflake,
    message: MessageTypes,
    extra?: RequestData
  ): Promise<types.RESTPostAPIChannelMessageResult> {
    return this.api.post(`/channels/${channelId}/messages`, {
      body: formatMessage(message).data,
      ...extra
    }) as any
  }

  deleteMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIChannelMessageResult> {
    return this.api.delete(
      `/channels/${channelId}/messages/${messageId}`,
      extra
    ) as any
  }

  bulkDeleteMessages(
    channelId: Snowflake,
    messageIds: Snowflake[]
  ): Promise<types.RESTPostAPIChannelMessagesBulkDeleteResult> {
    if (messageIds.length < 2)
      return this.deleteMessage(channelId, messageIds[0])

    return this.api.post(`/channels/${channelId}/messages/bulk-delete`, {
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
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      extra
    ) as any
  }

  kickMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIGuildMemberResult> {
    return this.api.delete(`/guilds/${guildId}/members/${userId}`, extra) as any
  }

  banMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTPutAPIGuildBanResult> {
    return this.api.put(`/guilds/${guildId}/bans/${userId}`, extra) as any
  }

  unbanMember(
    guildId: Snowflake,
    userId: Snowflake,
    extra?: RequestData
  ): Promise<types.RESTDeleteAPIGuildBanResult> {
    return this.api.delete(`/guilds/${guildId}/bans${userId}`, extra) as any
  }

  async createDM(
    userId: Snowflake
  ): Promise<types.RESTPostAPICurrentUserCreateDMChannelResult> {
    if (this.dmCache.has(userId)) return this.dmCache.get(userId) as any

    const channel = (await this.api.post('/users/@me/channels', {
      body: {
        recipient_id: userId
      }
    })) as types.RESTPostAPICurrentUserCreateDMChannelResult
    this.dmCache.set(userId, channel)

    return channel
  }

  async dm(userId: Snowflake, message: MessageTypes) {
    const channel = await this.createDM(userId)

    return this.sendMessage(channel.id, message)
  }

  leaveGuild(
    guildId: Snowflake
  ): Promise<types.RESTDeleteAPICurrentUserGuildResult> {
    return this.api.delete(`/users/@me/guilds/${guildId}`) as any
  }

  deleteWebhookMessage(
    webhookId: Snowflake,
    webhookToken: string,
    messageId: Snowflake
  ): Promise<types.RESTDeleteAPIChannelMessageUserReactionResult> {
    return this.api.delete(
      `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`
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
      `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(
        emoji
      )}/@me`
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
    return this.api.post(`/channels/${channelId}/webhooks`, {
      body: data
    }) as any
  }

  deleteWebhook(
    webhookId: Snowflake,
    token?: string
  ): Promise<types.RESTDeleteAPIWebhookWithTokenResult> {
    return this.api.delete(
      `/webhooks/${webhookId}/${token ? `/${token}` : ''}`
    ) as any
  }

  sendWebhookMessage(
    webhookId: Snowflake,
    webhookToken: string,
    message: types.RESTPostAPIWebhookWithTokenJSONBody
  ): Promise<types.RESTPostAPIWebhookWithTokenWaitResult> {
    return this.api.post(`/webhooks/${webhookId}/${webhookToken}`, {
      query: new URLSearchParams({ wait: 'true' }),
      body: message
    }) as any
  }

  getUserGuilds(
    token: string
  ): Promise<types.RESTGetAPICurrentUserGuildsResult> {
    return this.api.get(`/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      auth: false
    }) as any
  }

  getSelf(token: string): Promise<types.RESTGetAPICurrentUserResult> {
    return this.api.get('/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      auth: false
    }) as any
  }

  authorizeToken(
    request: types.RESTPostOAuth2AccessTokenURLEncodedData
  ): Promise<types.RESTPostOAuth2AccessTokenResult> {
    return this.api.post('/oauth2/token', {
      body: new URLSearchParams(request as any),
      contentType: 'urlencoded'
    }) as any
  }
}
