import { APIMessage, Snowflake } from 'discord-api-types'
import { WorkerManager } from '../managers/Worker'

import { Embed } from 'discord-rose'
import { FilterResponse } from './Filter'
import { CensorMethods } from 'typings'

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

  async log (type: CensorMethods, content: string, data: any, response: FilterResponse, log: Snowflake): Promise<APIMessage> {
    const embed = this.embed(log)
      .color(this.color)
      .timestamp()
      .footer(this.worker.config.links.site)

    switch (type) {
      case CensorMethods.Messages:
        embed.title('Deleted Message').description(`From <@${data.author.id}> in <#${data.channel_id}>`)
        break
      case CensorMethods.Names:
        embed.title('Removed Name').description(`User <@${data.user.id}>`)
        break
      case CensorMethods.Reactions:
        embed.title('Removed Reaction').description(`User <@${data.user_id}> on [this message](${
          `https://discord.com/channels/${data.guild_id}/${data.channel_id}/${data.message_id}`
        })`)
    }

    return await embed
      .field('Content', this.worker.filter.surround(content, response.ranges, '__'), true)
      .field('Filter(s)', response.filters.map(x => this.worker.filter.masks[x]).join(', '), true)
      .send()
  }

  async errorLog (log: Snowflake, message: string): Promise<APIMessage> {
    return await this.embed(log)
      .color(this.color)
      .title('Error occured')
      .description(message)
      .send()
  }
}
