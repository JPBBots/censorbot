import { CommandOptions } from 'discord-rose'

export default {
  command: 'debug',
  aliases: ['permissions'],
  description: 'Debug permissions and more',
  exec: (ctx) => {
    if (!ctx.myPerms('sendMessages')) return ctx.dm('I don\'t have permission to speak in this channel so therefore I cannot debug')

    if (!ctx.myPerms('embed')) return ctx.reply('I don\'t have `Embed Links` permission in order to send the debug interface.')

    const embed = ctx.embed
      .title('Debug')
      .color(ctx.worker.responses.color)
      .timestamp()

    embed.field('Permissions', ctx.worker.config.requiredPermissions.map(perm => `${ctx.myPerms(perm.permission) ? ':white_check_mark:' : ':x:'}  ${perm.vital ? ':exclamation:' : ''} __${perm.name}__: ${perm.why}`).join('\n') + '\n\n:exclamation: means the permission is vital')

    void embed.send()
  }
} as CommandOptions
