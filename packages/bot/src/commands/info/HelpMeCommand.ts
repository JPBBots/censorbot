import {
  Command,
  CommandError,
  Guild,
  Options,
  Permissions,
  Run,
  SubCommand,
  Worker
} from '@jadl/cmd'
import { WorkerManager } from '../../managers/Worker'
import { APIGuild } from 'discord-api-types/v9'
import { Admin } from '../decorators/Admin'
import { AdminGuild } from '../decorators/AdminGuild'
import { Embed, MessageBuilder } from '@jadl/builders'
import { MessageFlags } from 'discord-api-types/v10'

@Command('helpme', 'Creates an easy code to give to helpers')
export class HelpMeCommand {
  @Run()
  async createHelpMe(
    @Guild() guild: APIGuild,
    @Worker() worker: WorkerManager
  ) {
    if (guild.id === '399688888739692552') {
      return new MessageBuilder()
        .addEmbed(
          new Embed().description('Run /helpme in your server, not here!')
        )
        .setMessage({ flags: MessageFlags.Ephemeral })
    }

    const code = await worker.comms.sendCommand('CREATE_HELPME', {
      id: guild.id
    })

    return new MessageBuilder()
      .addEmbed(
        new Embed()
          .title('Your HelpME Code')
          .description(`\`${code}\`, give this code to the helper asking.`)
          .footer('No private information is attached to the code.')
      )
      .setMessage({ flags: MessageFlags.Ephemeral })
  }
}

@Command('helpmeadmin', 'Creates an easy code to give to helpers')
@AdminGuild()
@Permissions('moderateMembers')
export class AdminHelpMeCommand {
  @SubCommand('get', 'Gets a generated HelpME code')
  @Admin()
  async getHelpMeCode(
    @Options.String('code', 'Code to get', { required: true }) code: string,
    @Worker() worker: WorkerManager
  ) {
    const id = await worker.comms
      .sendCommand('GET_HELPME', { code })
      .catch(() => null)

    if (!id) throw new CommandError('Invalid HelpME Code')

    return new MessageBuilder()
      .addEmbed(new Embed().description(`https://censor.bot/dashboard/${id}`))
      .setMessage({ flags: MessageFlags.Ephemeral })
  }
}
