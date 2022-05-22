import {
  Command,
  Run,
  Thinks,
  Worker,
  Guild,
  Options,
  Permissions
} from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import {
  APIGuild,
  APIGuildMember,
  APIUser,
  Snowflake
} from 'discord-api-types/v9'
import { WorkerManager } from '../../managers/Worker'
import { Premium } from '../decorators/Premium'

@Command('purgeresends', 'Purge the resends for a specific user')
@Permissions('manageMessages')
export class PurgeResendsCommand {
  @Run()
  @Thinks()
  @Premium()
  async run(
    @Worker() worker: WorkerManager,
    @Guild(true) { id: guildId }: APIGuild,
    @Options.Member('member', "The member's resends to purge", {
      required: true
    })
    { user: { id: userId } }: APIGuildMember & { user: APIUser }
  ) {
    return await PurgeResendsCommand.deleteUserResends(worker, guildId, userId)
  }

  static async deleteUserResends(
    worker: WorkerManager,
    guildId: Snowflake,
    userId: Snowflake
  ) {
    const guild = worker.actions.resends.get(guildId)
    if (!guild)
      return new Embed().title('Could not find any resends for this server')

    const user = guild.get(userId)
    if (!user)
      return new Embed().title('Could not find any resends for this user')

    const channels = user.reduce((obj, message) => {
      if (!obj[message.channelId]) obj[message.channelId] = []
      obj[message.channelId].push(message.id)
      return obj
    }, {})

    for (const channelId in channels) {
      await worker.requests.bulkDeleteMessages(channelId, channels[channelId])
    }

    guild.delete(userId)
    if (guild.size < 1) worker.actions.resends.delete(guildId)

    return new Embed().description(
      `Deleted ${user.length} resends for <@${userId}>`
    )
  }
}
