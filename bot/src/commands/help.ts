import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'help',
  aliases: ['h', 'ayuda', 'hilfe', 'помощь'],
  exec: (ctx) => {
    ctx.reply('test')
  }
} as CommandOptions