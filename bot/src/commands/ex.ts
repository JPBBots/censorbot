import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'ex',
  aliases: [],
  description: 'ex',
  admin: true,
  exec: (ctx) => {
    void +ctx.reply('ex')
  }
} as CommandOptions
