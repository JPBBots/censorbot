import { APIMessage, ChannelType, Snowflake } from 'discord-api-types/v9'
import { WorkerManager } from '../managers/Worker'

import {
  CensorMethods,
  GuildDB,
  baseFilterNames,
  FilterResultInfo,
  FilterType,
  filterTypeNames,
  PlaceInfo
} from '@censorbot/typings'
import { EmbedWithSendback } from '@jadl/builders'

const LENGTH_MESSAGE = '- messsage too long'
const DESCRIPTION_MAX_LENGTH = 2048

export class Responses {
  color = 0xea5455

  constructor(public worker: WorkerManager) {}

  embed(channel: Snowflake) {
    return new EmbedWithSendback<Promise<APIMessage>>(async (embed) => {
      return await this.worker.requests.sendMessage(channel, embed)
    })
  }

  async missingPermissions(
    channel: Snowflake,
    permission: string
  ): Promise<APIMessage> {
    return await this.embed(channel)
      .color(this.color)
      .title('Missing permissions!')
      .description(`Make sure the bot has the \`${permission}\` permission.`)
      .send()
  }

  async popup(
    channel: Snowflake,
    user: Snowflake,
    message: string,
    dm: boolean
  ): Promise<APIMessage> {
    return await this.embed(
      dm ? await this.worker.requests.createDM(user).then((x) => x.id) : channel
    )
      .color(this.color)
      .description(`<@${user}> ${message}`)
      .send()
  }

  canLog(guildId: Snowflake, logId: Snowflake): boolean {
    if (
      !this.worker.hasPerms(
        guildId,
        ['sendMessages', 'viewChannel', 'embed'],
        logId
      )
    )
      return false

    const log = this.worker.channels.get(logId)
    if (
      !log ||
      !('guild_id' in log) ||
      log.guild_id !== guildId ||
      log.type !== ChannelType.GuildText
    )
      return false

    return true
  }

  async log(
    type: CensorMethods,
    content: string,
    data: any,
    response: FilterResultInfo,
    db: GuildDB
  ): Promise<void> {
    if (!db.log || !db.id || !this.canLog(db.id, db.log)) return

    const embed = this.embed(db.log)
      .color(this.color)
      .timestamp()
      .footer(this.worker.config.links.site)

    switch (type) {
      case CensorMethods.Messages:
        embed
          .title('Deleted Message')
          .field('User', `<@${data.author.id}>`, true)
          .field('Channel', `<#${data.channel_id}>`, true)
        break
      case CensorMethods.Names:
        embed.title('Removed Name').field('User', `<@${data.user.id}>`, true)
        break
      case CensorMethods.Reactions:
        embed
          .title('Removed Reaction')
          .field(
            'Info',
            `User <@${
              data.user_id
            }> on [this message](${`https://discord.com/channels/${data.guild_id}/${data.channel_id}/${data.message_id}`})`,
            true
          )
        break
      case CensorMethods.Threads:
        embed.title('Changed Thread Name').field('Thread', `<#${data}>`, true)
        break
      case CensorMethods.Avatars:
        embed
          .title('Kicked Member for NSFW Avatar')
          .field('User', `<@${data.user.id}>`, true)
        break
    }

    if (
      response.type === FilterType.BaseFilter ||
      response.type === FilterType.ServerFilter
    ) {
      content = this.worker.filter.surround(content, response.ranges, '__')
      if (content.length > DESCRIPTION_MAX_LENGTH) {
        content =
          content.slice(0, DESCRIPTION_MAX_LENGTH - LENGTH_MESSAGE.length) +
          LENGTH_MESSAGE
      }

      const customPlaces: string[] = [
        ...new Set(
          response.places
            .filter((x) => x.type === FilterType.ServerFilter)
            .map((x) => x.text)
        )
      ]

      if (customPlaces.length >= 1) {
        embed.field('Places', customPlaces.join(', ').slice(0, 256))
      }
    }

    embed
      .description(`${content || 'None'}`)
      .field(
        'Filter(s)',
        (response.type === FilterType.BaseFilter
          ? response.filters.map((x) => baseFilterNames[x]).join(', ')
          : filterTypeNames[response.type]) || 'None',
        true
      )

    if ('percentage' in response) {
      embed.field('Prediction', response.percentage || '0%', true)
    }

    await embed.send()
  }

  async errorLog(db: GuildDB, message: string): Promise<APIMessage | false> {
    if (!db.log || !db.id || !this.canLog(db.id, db.log)) return false

    return await this.embed(db.log)
      .color(this.color)
      .title('Error occured')
      .description(message)
      .send()
  }
}
