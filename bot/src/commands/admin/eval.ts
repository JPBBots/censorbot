import { CommandOptions } from 'discord-rose/dist/typings/lib'

import { NonFatalError } from '../../utils/NonFatalError'

function clean (text) {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

let last
let temp

export default {
  command: 'eval',
  admin: true,
  description: 'Evaluates code',
  exec: async (ctx) => {
    if (ctx.message.author.id !== '142408079177285632') throw new NonFatalError('Bonk, no eval fo u')

    const worker = ctx.worker

    try {
      const code = ctx.args.join('\n')

      let evaled
      if (ctx.flags.m) evaled = await worker.comms.masterEval(code)
      else if (ctx.flags.b) evaled = await worker.comms.broadcastEval(code)
      else evaled = eval(code)

      if (ctx.flags.last) last = evaled

      if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }

      ctx.embed
        .color(0x28bf62)
        .title('Eval Successful')
        .description(`\`\`\`xl\n${evaled}\`\`\``)
        .send()
    } catch (err) {
      ctx.embed
        .color(0xdb0b0b)
        .title('Eval Unsuccessful')
        .description(`\`\`\`xl\n${clean(err)}\`\`\``)
        .send()
    }
  }
} as CommandOptions
