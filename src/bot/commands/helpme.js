exports.run = async function (message, args) {
  if (args[0] && await this.client.isAdmin(message.author.id)) {
    this.delete()
    const helpme = await this.client.cluster.internal.getHelpMe(args[0])
    if (!helpme) return this.send('Invalid HelpME...')

    return this.client.interface.dm(message.author.id,
      this.embed
        .title(`${helpme.id} (${helpme.name};${this.client.guildShard(helpme.id)})`)
        .description(`[Dashboard](https://censor.bot/dashboard/${helpme.id})`)
        .field('Owner', helpme.owner)
    )
  }

  const guild = this.client.guilds.get(message.guild_id)
  const id = await this.client.cluster.internal.createHelpMe(guild.id, guild.name, guild.owner_id)

  this.send(
    this.embed
      .description(`:package: Your HelpME has been packed! Here's your code: \`${id}\``)
      .footer('Give this code to the helper that asked. No private information is attached.')
  )
}

exports.info = {
  name: 'helpme',
  description: 'Pack a HelpME code for easier helper usage.',
  aliases: [],
  usage: '{prefix}helpme'
}
