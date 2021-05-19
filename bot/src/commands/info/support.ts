import { CommandOptions } from 'discord-rose'

export default {
  command: 'support',
  aliases: ['s'],
  interaction: {
    name: 'support',
    description: 'Get help from real people'
  },
  description: 'Get help from real people',
  exec: (ctx) => {
    void ctx.reply(`Join for help: ${ctx.worker.config.links.support}`)
  }
} as CommandOptions
