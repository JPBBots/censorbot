import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'test',
  aliases: [],
  exec: (ctx) => {
    ctx.reply('test')
    ctx.worker.api.messages.react(ctx.channel.id, ctx.message.id, '🧪');
  }
} as CommandOptions
