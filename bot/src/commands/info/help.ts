import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'help',
  aliases: ['h', 'ayuda', 'hilfe', 'помощь'],
  description: 'Shows a list of commands and useful links',
  exec: (ctx) => {
    const links = ctx.worker.config.links
    void ctx.embed
      .description(`Change the bot here: ${links.dashboard}`)
      .field('Helpful links', `[Dashboard](${links.dashboard}) | [Support](${links.support}) | [Invite](${links.invite})\n[Website](${links.site}) | [Patreon](${links.patreon})`)
      .field('Commands', `${String(ctx.worker.commands.commands?.filter(x => !x.admin).map(x => `__${ctx.prefix}${String(x.command)}__: ${x.description}`).join('\n'))}`)
      .send()
  }
} as CommandOptions
