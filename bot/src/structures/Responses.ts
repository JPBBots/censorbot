import { APIMessage, GatewayMessageReactionAddDispatchData, Snowflake } from "discord-api-types";
import { WorkerManager } from "../managers/Worker";

import { Embed } from 'discord-rose'
import { FilterResponse } from "./Filter";

export enum ActionType {
  Message = 0,
  EditedMessage,
  Nickname,
  Reaction
}

export class Responses {
  color = 0xea5455

  constructor (public worker: WorkerManager) {}

  embed (channel: Snowflake) {
    return new Embed(async (embed) => {
      return this.worker.api.messages.send(channel, embed)
    })
  }

  missingPermissions (channel: Snowflake, permission: string) {
    return this.embed(channel)
      .color(this.color)
      .title('Missing permissions!')
      .description(`Make sure the bot has the \`${permission}\` permission.`)
      .send()
  }

  popup (channel: Snowflake, user: Snowflake, message: string) {
    return this.embed(channel)
      .color(this.color)
      .description(`<@${user}> ${message}`)
      .send()
  }

  log (type: ActionType, content: string, data: any, response: FilterResponse, log: Snowflake) {
    const embed = this.embed(log)
      .color(this.color)
      .timestamp()
      .footer(this.worker.config.links.site)

    switch (type) {
      case ActionType.Message:
        embed.title('Deleted Message').description(`From <@${data.author.id}> in <#${data.channel_id}>`)
        break
      case ActionType.EditedMessage:
        embed.title('Deleted Edited Message').description(`From <@${data.author.id}> in <#${data.channel_id}>`)
        break
      case ActionType.Nickname:
        embed.title('Removed Nickname').description(`User <@${data.author.id}>`)
        break
      case ActionType.Reaction:
        embed.title('Removed Reaction').description(`User <@${data.author.id}> on [this message](${
          `https://discord.com/channels/${data.guild_id}/${data.channel_id}/${data.message_id}`
        })`)
    }

    return embed
      .field('Content', this.worker.filter.surround(content, response.ranges, '__'), true)
      .field('Filter(s)', response.filters.map(x => this.worker.filter.masks[x]).join(', '), true)
      .send()
  }
}