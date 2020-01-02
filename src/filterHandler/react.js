module.exports = async (client, reaction, user) => {
  var message = reaction.message
  if (message.guild && message.guild.id == '264445053596991498') return
  if (message.channel.nsfw) return

  const member = message.guild.members.get(user.id) || await message.guild.members.fetch(user.id)

  var data = await client.rdb.getAll(message.guild.id)
  if (data.role && member.roles.has(data.role)) return
  if (!data.censor.react) return

  var response
  if (client.serverFilters[message.guild.id]) response = client.serverFilters[message.guild.id].test(reaction.emoji.name, true, data.filter, data.uncensor)
  else response = response = await client.filter.test(reaction.emoji.name, data.base, data.filter, data.uncensor)
  if (response.censor) {
    var msg = message
    var error
    try {
      await reaction.users.remove(user)
    } catch (err) {
      console.log(`Shard ${client.shard.id} | ${message.guild.name} ${message.guild.id} ${err.message}`.red)
      error = 'Error! Missing permission to manage messages!'
    }
    console.log(`Shard ${client.shard.id} | Removed reaction from ${user} ${user.username}: `.yellow + `${reaction.emoji.name}`.yellow.underline)
    var log 
    if (data.log) {
      log = msg.guild.channels.get(data.log)
      if (log) log.send(client.embeds.log([reaction.emoji.name, reaction.emoji.url || ''], reaction.message, response.method, 3, error))
    }
    if (data.punishment.on) {
      console.log('punish')
      var role = msg.guild.roles.get(data.punishment.role)
      if (!role) return
      var use = await client.punishdb.find({ u: user.id, g: msg.guild.id })
      if (!use) {
        use = {
          u: user.id,
          g: msg.guild.id,
          a: 0
        }
        await client.punishdb.create(null, { u: user.id, g: msg.guild.id, a: 0 })
      }
      if (use.a + 1 >= data.punishment.amount) {
        const mem = msg.guild.members.get(user.id)
        if (mem) mem.roles.add(role)
        client.punishdb.delete({ u: user.id, g: msg.guild.id })
        if (log) log.send(client.u.embed
          .setTitle('User Punished')
          .setDescription(`${user} Reached the max ${data.punishment.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
          .setColor('RED')
          .setFooter('This system is heavily WIP!')
        )
      } else {
        client.punishdb.add({ u: user.id, g: msg.guild.id }, 'a', 1)
      }
    }
  }
}
