import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'dashboard',
  aliases: ['dash', 'settings'],
  description: 'Sends a link to the dashboard',
  exec: (ctx) => {
    ctx.reply(`Change server settings here: ${ctx.worker.config.links.dashboard}`)
  }
} as CommandOptions
