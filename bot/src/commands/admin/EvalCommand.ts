import {
  Channel,
  Command,
  EphemeralEmbed,
  Guild,
  GuildInteraction,
  Options,
  Run,
  Worker
} from '@jadl/cmd'
import { WorkerManager } from '../../managers/Worker'

import util from 'util'
import { Owner } from '../decorators/Owner'
import { APIChannel, APIGuild } from 'discord-api-types'

function clean(text): string {
  if (typeof text === 'string') {
    return text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
  } else {
    return text
  }
}

@Command('eval')
@GuildInteraction('569907007465848842')
export class EvalCommand {
  @Run()
  @Owner()
  async run(
    @Worker() worker: WorkerManager,
    @Options.Boolean('master', 'Eval on master') masterEval: boolean = false,
    @Options.Boolean('broadcast', 'Broadcast on all clusters')
    broadcastEval: boolean = false,
    @Options.String('code', 'Code to run', { required: true }) code: string,
    @Guild() guild: APIGuild,
    @Channel() channel: APIChannel
  ) {
    try {
      let evaled: string | string[] | Promise<any>

      if (masterEval) evaled = await worker.comms.masterEval(code)
      else if (broadcastEval) evaled = await worker.comms.broadcastEval(code)
      // eslint-disable-next-line no-eval
      else evaled = eval(code)

      if (evaled && evaled instanceof Promise) evaled = await evaled

      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled)
      }

      return new EphemeralEmbed()
        .color(0x28bf62)
        .title('Eval Successful')
        .description(`\`\`\`xl\n${evaled}\`\`\``)
    } catch (err) {
      return new EphemeralEmbed()
        .color(0xdb0b0b)
        .title('Eval Unsuccessful')
        .description(`\`\`\`xl\n${clean(err)}\`\`\``)
    }
  }
}
