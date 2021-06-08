import { CommandOptions } from 'discord-rose'

export default {
  command: 'ex',
  aliases: [],
  description: 'ex',
  admin: true,
  exec: (ctx) => {
    void ctx.reply('ex')
    throw new Error('a')
  }
} as CommandOptions
