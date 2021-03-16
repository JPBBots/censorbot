import { APIMessage, GatewayGuildMemberUpdateDispatchData, GatewayMessageReactionAddDispatchData, Snowflake } from 'discord-api-types'
import { WorkerManager } from '../managers/Worker'

import { Embed } from 'discord-rose'
import { FilterResponse } from './Filter'

export enum ActionType {
  Message = 0,
  EditedMessage,
  Nickname,
  Reaction
}

export class Responses {
  color = 0xea5455

  constructor (public worker: WorkerManager) {}

  embed (channel: Snowflake): Embed {
    return new Embed(async (embed) => {
      return await this.worker.api.messages.send(channel, embed)
    })
  }

  async missingPermissions (channel: Snowflake, permission: string): Promise<APIMessage> {
    return await this.embed(channel)
      .color(this.color)
      .title('Missing permissions!')
      .description(`Make sure the bot has the \`${permission}\` permission.`)
      .send()
  }

  async popup (channel: Snowflake, user: Snowflake, message: string): Promise<APIMessage> {
    return await this.embed(channel)
      .color(this.color)
      .description(`<@${user}> ${message}`)
      .send()
  }

  async log (type: ActionType, content: string, data: APIMessage | GatewayGuildMemberUpdateDispatchData | GatewayMessageReactionAddDispatchData, response: FilterResponse, log: Snowflake): Promise<APIMessage> {
    const embed = this.embed(log)
      .color(this.color)
      .timestamp()
      .footer(this.worker.config.links.site)

    switch (type) {
      case ActionType.Message:
        embed.title('Deleted Message').description(`From <@${(data as APIMessage).author.id}> in <#${(data as APIMessage).channel_id}>`)
        break
      case ActionType.EditedMessage:
        embed.title('Deleted Edited Message').description(`From <@${(data as APIMessage).author.id}> in <#${(data as APIMessage).channel_id}>`)
        break
      case ActionType.Nickname:
        embed.title('Removed Nickname').description(`User <@${String((data as GatewayGuildMemberUpdateDispatchData).user?.id)}>`)
        break
      case ActionType.Reaction:
        embed.title('Removed Reaction').description(`User <@${(data as GatewayMessageReactionAddDispatchData).user_id}> on [this message](${
          `https://discord.com/channels/${(data as GatewayMessageReactionAddDispatchData).guild_id as string}/${(data as GatewayMessageReactionAddDispatchData).channel_id}/${(data as GatewayMessageReactionAddDispatchData).message_id}`
        })`)
    }

    return await embed
      .field('Content', this.worker.filter.surround(content, response.ranges, '__'), true)
      .field('Filter(s)', response.filters.map(x => this.worker.filter.masks[x]).join(', '), true)
      .send()
  }
}
