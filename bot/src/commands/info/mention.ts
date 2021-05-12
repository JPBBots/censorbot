import { CommandOptions } from 'discord-rose'

export default {
  command: '',
  aliases: [],
  exec: (ctx) => {
    if (!ctx.prefix.startsWith('<@') || ctx.args.length > 0) return

    const mention = `<@${ctx.worker.user.id}>`

    void ctx.embed
      .title('Censor Bot')
      .description(`My prefix in this server is \`${ctx.db.prefix ?? mention}\``)
      .footer(`Do ${ctx.db.prefix}help to get help`)
      .send()
  }
} as CommandOptions
