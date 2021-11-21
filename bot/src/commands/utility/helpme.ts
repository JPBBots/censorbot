import { ApplicationCommandOptionType } from 'discord-api-types'
import { CommandOptions } from 'discord-rose'

export default {
  command: 'helpme',
  aliases: [],
  interaction: {
    name: 'helpme',
    description: 'Creates an easy code to give to helpers',
    options: [
      {
        name: 'code',
        description: 'HelpME Code, (helper use only)',
        type: ApplicationCommandOptionType.String
      }
    ]
  },
  description: 'Creates an easy code to give to helpers',
  exec: async (ctx) => {
    if (!ctx.guild) return
    if (ctx.isInteraction) {
      ctx.args = [ctx.options.code]
    }

    if (
      ctx.args[0] &&
      (await ctx.worker.interface.api.isAdmin(ctx.author.id))
    ) {
      const code = ctx.args[0]

      const id: any = await ctx.worker.comms.sendCommand('GET_HELPME', { code })
      if (id instanceof Error) return void ctx.error('Invalid HelpME Code')

      return void ctx.dm(`https://censor.bot/dashboard/${id}`)
    }

    if (ctx.guild.id === '399688888739692552') {
      return await ctx.embed
        .description('Run +helpme in your server, not here!')
        .send()
    }

    const code = await ctx.worker.comms.sendCommand('CREATE_HELPME', {
      id: ctx.guild.id
    })

    return void ctx.embed
      .title('Your HelpME Code')
      .description(`\`${code}\`, give this code to the helper asking.`)
      .footer('No private information is attached to the code.')
      .send()
  }
} as CommandOptions
