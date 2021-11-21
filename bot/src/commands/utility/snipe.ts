import { ApplicationCommandOptionType } from 'discord-api-types'
import { CommandOptions } from 'discord-rose'

export default {
  command: 'snipe',
  description: 'Snipe the latest deleted message by Censor Bot from a channel',
  userPerms: ['manageMessages'],
  interaction: {
    name: 'snipe',
    description:
      'Snipe the latest deleted message by Censor Bot from a channel',
    options: [
      {
        name: 'channel',
        required: false,
        description:
          'Snipes from a specific channel (defaults to where the command is being ran)',
        type: ApplicationCommandOptionType.Channel
      },
      {
        name: 'show',
        description: 'Whether or not to show to everyone, defaults to hidden',
        type: ApplicationCommandOptionType.Boolean,
        default: false
      }
    ]
  },
  exec: (ctx) => {
    if (!ctx.channel) return

    const recent = ctx.worker.snipes.get(ctx.options.channel ?? ctx.channel.id)
    if (!recent)
      return ctx.error('No recent message found deleted by Censor Bot')

    void ctx.embed
      .title('Sniped Message')
      .description(recent)
      .send(true, false, !ctx.options.show)
  }
} as CommandOptions
