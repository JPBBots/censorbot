import { CommandOptions } from 'discord-rose'

export default {
  command: 'helpme',
  aliases: [],
  description: 'Creates an easy code to give to helpers',
  exec: async (ctx) => {
    if (!ctx.guild) return

    if (!ctx.args[0]) {
      const code = await ctx.worker.comms.sendCommand('CREATE_HELPME', { id: ctx.guild.id })

      return void ctx.embed
        .title('Your HelpME Code')
        .description(`\`${code}\`, give this code to the helper asking.`)
        .footer('No private information is attached to the code.')
        .send()
    }

    if (!await ctx.worker.interface.api.isAdmin(ctx.author.id)) throw new Error('You must be admin to run this command.')

    const code = ctx.args[0]

    const id: any = await ctx.worker.comms.sendCommand('GET_HELPME', { code })
    if (id instanceof Error) return void ctx.error('Invalid HelpME Code')

    void ctx.dm(`https://censor.bot/dashboard/${id}`)
  }
} as CommandOptions
