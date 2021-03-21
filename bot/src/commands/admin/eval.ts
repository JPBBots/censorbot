import { CommandOptions } from 'discord-rose'

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
      const code = ctx.message.content.slice(Number(ctx.prefix.length) + Number(ctx.ran.length))

      let evaled: string|string[]|Promise<any>
      if (ctx.flags.m) evaled = await worker.comms.masterEval(code)
      else if (ctx.flags.b) evaled = await worker.comms.broadcastEval(code)
      // eslint-disable-next-line no-eval
      else evaled = eval(code)

      if (evaled && evaled instanceof Promise) evaled = await evaled

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (ctx.flags.l) last = evaled

      if (typeof evaled !== 'string') { evaled = util.inspect(evaled) }

      if (ctx.flags.s) return

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
