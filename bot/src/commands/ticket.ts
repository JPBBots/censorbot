import { ApplicationCommandOptionType } from 'discord-api-types'
import { CommandOptions } from 'discord-rose'

export default {
  command: 'ticket',
  aliases: [],
  interaction: {
    name: 'ticket',
    description: 'Sends a ticket for words that should be uncensored.',
    options: [{
      name: 'word',
      description: 'The word or phrase that shouldn\'t be censored',
      type: ApplicationCommandOptionType.STRING,
      required: true
    }]
  },
  description: 'Sends a ticket for words that should be uncensored.',
  exec: async (ctx) => {
    if (!ctx.args[0]) {
      return void ctx.embed
        .title('Tickets')
        .description('For when words shouldn\'t be censored by the base filter but they are.\n\n' +
        `Format: \`${ctx.prefix}ticket [word / phrase]\``)
        .footer(`${ctx.author.username}#${ctx.author.discriminator}`)
        .send(false)
    }

    const id = await ctx.worker.tickets.create(ctx.args.join(' '), ctx.author.id)
    if (!id) return

    void ctx.embed
      .title(`Ticket submitted (${id})`)
      .description('We\'ll get back to you soon on our decision! Hang tight.')
      .footer(`${ctx.author.username}#${ctx.author.discriminator}`)
      .send(false, false, true)
  }
} as CommandOptions
