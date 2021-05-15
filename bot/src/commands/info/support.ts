import { CommandOptions } from 'discord-rose'

export default {
  command: 'support',
  aliases: ['s'],
  description: 'Get help from real people',
  exec: (ctx) => {
    void ctx.reply(`Join for help: ${ctx.worker.config.links.support}`)
  }
} as CommandOptions
