import { CommandOptions } from 'discord-rose'

export default {
  command: 'dashboard',
  aliases: ['dash', 'settings', 'setlog', 'filter'],
  interaction: {
    name: 'dashboard',
    description: 'Sends a link to the dashboard'
  },
  description: 'Sends a link to the dashboard',
  exec: (ctx) => {
    if (ctx.flags.i) return void ctx.reply(`${ctx.worker.config.links.site}/dashboard/${ctx.guild?.id}`)
    void ctx.reply(`Change server settings here: ${ctx.worker.config.links.dashboard}`)
  }
} as CommandOptions
