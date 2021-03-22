import { CommandOptions } from 'discord-rose'

import { Reloaders } from '../../types'

export default {
  command: 'reload',
  aliases: ['r'],
  description: 'Reloads a certain aspect',
  admin: true,
  exec: (ctx) => {
    const reloading = Reloaders.find(x => x === ctx.args[0]?.toUpperCase())
    if (!reloading) return ctx.error(`${ctx.args[0]} not one of ${Reloaders.join(', ')}`)

    ctx.worker.comms.tell('RELOAD', reloading)

    void ctx.embed.title(`Reloaded ${reloading}`).send()
  }
} as CommandOptions
