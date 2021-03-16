import { CommandOptions } from 'discord-rose/dist/typings/lib'

import { NonFatalError } from '../../utils/NonFatalError'

import util from 'util'

function clean (text): string {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

let last
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let temp: any

export default {
  command: 'eval',
  admin: true,
  description: 'Evaluates code',
  exec: async (ctx) => {
    if (ctx.message.author.id !== '142408079177285632') throw new NonFatalError('Bonk, no eval fo u')

    const worker = ctx.worker

    try {
      const code = ctx.args.join('\n')

      let evaled: string|string[]
      if (ctx.flags.m) evaled = await worker.comms.masterEval(code)
      else if (ctx.flags.b) evaled = await worker.comms.broadcastEval(code)
      // eslint-disable-next-line no-eval
      else evaled = eval(code)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (ctx.flags.last) last = evaled

      if (typeof evaled !== 'string') { evaled = util.inspect(evaled) }

      void ctx.embed
        .color(0x28bf62)
        .title('Eval Successful')
        .description(`\`\`\`xl\n${evaled}\`\`\``)
        .send()
    } catch (err) {
      void ctx.embed
        .color(0xdb0b0b)
        .title('Eval Unsuccessful')
        .description(`\`\`\`xl\n${clean(err)}\`\`\``)
        .send()
    }
  }
} as CommandOptions
