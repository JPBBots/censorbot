import {
  Channel,
  Command,
  CommandError,
  Options,
  Permissions,
  Run,
  Worker
} from '@jadl/cmd'
import { Embed, MessageBuilder } from '@jadl/builders'
import { APIChannel, Snowflake } from 'discord-api-types/v9'
import { WorkerManager } from '../../managers/Worker'
import { MessageFlags } from 'discord-api-types/v10'

@Command(
  'snipe',
  'Snipe the latest deleted message by Censor Bot from a channel'
)
@Permissions('manageMessages')
export class SnipeCommand {
  @Run()
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

    return new MessageBuilder()
      .addEmbed(new Embed().title('Sniped Message').description(snipe))
      .setMessage({ flags: MessageFlags.Ephemeral })
  }
}
