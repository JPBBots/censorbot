import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'test',
  aliases: [],
  exec: (ctx) => {
    ctx.reply('test')
  }
} as CommandOptions