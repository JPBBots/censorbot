import {
  Channel,
  Command,
  CommandError,
  EphemeralEmbed,
  Options,
  Run,
  UserPerms,
  Worker
} from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import { APIChannel, Snowflake } from 'discord-api-types'
import { WorkerManager } from '../../managers/Worker'

@Command(
  'snipe',
  'Snipe the latest deleted message by Censor Bot from a channel'
)
export class SnipeCommand {
  @Run()
  @UserPerms('manageMessages')
  run(
    @Options.Channel(
      'channel',
      'Snipes from a specific channel (defaults to where the command is being ran)'
    )
    channelId: Snowflake,
    @Channel() channel: APIChannel,
    @Options.Boolean(
      'show',
      'Whether or not to show to everyone, defaults to hidden'
    )
    show: boolean = false,
    @Worker() worker: WorkerManager
  ) {
    const snipe = worker.snipes.get(channelId ?? channel.id)

    if (!snipe)
      throw new CommandError('No recent message found deleted by Censor Bot')

    return new (show ? Embed : EphemeralEmbed)()
      .title('Sniped Message')
      .description(snipe)
  }
}
