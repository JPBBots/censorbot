module.exports = async (client, oldMessage, newMessage) => {
  if (oldMessage.author.bot) return
  if (!oldMessage.guild) return

  if (!newMessage.content.startsWith(client.config.prefix) && !newMessage.content.startsWith(`<@${client.user.id}>`) && !newMessage.content.startsWith(`<@!${client.user.id}>`)) return
  var prefix
  if (newMessage.guild.id == '264445053596991498' && newMessage.content.startsWith(client.config.prefix)) return
  if (newMessage.content.startsWith(client.config.prefix)) prefix = client.config.prefix
  else if (newMessage.content.startsWith('<@')) {
    if (newMessage.content.startsWith('<@!')) prefix = `<@!${client.user.id}> `
    else prefix = `<@${client.user.id}> `

    newMessage.mentions.users.delete(client.user.id)
    newMessage.mentions.members.delete(client.user.id)
  }

  const args = newMessage.content.slice(prefix.length).split(' ')
  const command = args.shift().toLowerCase()

  console.log(command)

  if (command !== 'eval') return
  const v = client.commands.get(command)

  if (v.info.admin) {
    var res = await client.shard.broadcastEval(`
            const guild = this.guilds.get("399688888739692552");
            if(guild) {
                guild.roles.get("415323805943070721").members.has("${newMessage.author.id}")
            }
        `)
    if (!res.includes(true) && newMessage.author.id !== '536004227470721055') return newMessage.reply('You don\'t have permission to run that command!')
  }

  v.run(client, newMessage, args, newMessage.guild.db())
}
