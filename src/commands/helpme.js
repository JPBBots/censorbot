const GenerateID = require('../../util/GenerateID')

exports.run = async function (message, args) {
  if (args[0] && await this.client.isAdmin(message.author.id)) {
    this.delete()
    const helpme = this.client.helpme.get(args[0])
    if (!helpme) return this.send('Invalid HelpME...')

    const guild = this.client.guilds.get(helpme.id)
    if (!guild) return this.send('Bot no longer in that server...')

    return this.client.interface.dm(message.author.id,
      this.embed
        .title(`${guild.id} (${guild.name})`)
        .description(`[Dashboard](https://censorbot.jt3ch.net/dash/${guild.id})`)
        .field('Owner', guild.owner_id)
    )
  }

  const current = this.client.helpme.find(x => x.id === message.guild_id)
  let id
  if (current) {
    id = current.hm
  } else {
    id = GenerateID(this.client.helpme.keyArray())
    this.client.helpme.set(id, {
      hm: id,
      id: message.guild_id
    })
    setTimeout(() => {
      this.client.helpme.delete(id)
    }, 300000)
  }

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
