import { Channel, Command, Run, Thinks, Worker, Permissions } from '@jadl/cmd'
import { Embed } from '@jadl/builders'
import { APIChannel } from 'discord-api-types/v9'
import { GuildDB } from '@censorbot/typings'
import { WorkerManager } from '../../managers/Worker'
import { SnowflakeUtil } from '@censorbot/utils'
import { Db } from '../decorators/Db'
import { Premium } from '../decorators/Premium'

@Command('scan', 'Scans the last 100 messages and deletes any with curses')
@Permissions('manageMessages')
export class ScanCommand {
  @Run()
  @Thinks()
  @Premium()
  async run(
    @Channel() channel: APIChannel,
    @Worker() worker: WorkerManager,
    @Db() db: GuildDB
  ) {
    const messages = await worker.requests.getMessages(channel.id)

    const msgIds = messages
      .filter(
        (x) =>
          !x.author.bot &&
          Date.now() - SnowflakeUtil.getTimestamp(x.id).getTime() < 1.21e9 &&
          worker.filter.test(x.content, db.filter)
      )
      .map((x) => x.id)

    if (msgIds.length > 0)
      await worker.requests.bulkDeleteMessages(channel.id, msgIds)

    return new Embed()
      .color(worker.responses.color)
      .title(
        `Deleted ${msgIds.length} message${
          msgIds.length === 1 ? '' : 's'
        } with curses`
      )
  }
}
