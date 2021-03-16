import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'invite',
  aliases: ['inv'],
  description: 'Sends a link to invite the bot',
  exec: (ctx) => {
    void ctx.reply(`Invite the bot here: <${ctx.worker.config.links.invite}>`)
  }
} as CommandOptions
