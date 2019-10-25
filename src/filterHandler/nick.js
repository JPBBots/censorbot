module.exports = async (client, oldMember, newMember) => {
  if (oldMember.guild && oldMember.guild.id == '264445053596991498') return
  if (oldMember.displayName == newMember.displayName) return
  var oldDisplayName = oldMember.displayName
  var newDisplayName = newMember.displayName
  var data = await client.rdb.getAll(oldMember.guild.id)
  if (data.role && newMember.roles.has(data.role)) return
  if (!data.censor.nick) return

  var response
  if (client.serverFilters[newMember.guild.id]) response = client.serverFilters[newMember.guild.id].test(newDisplayName, true, data.filter, data.uncensor)
  else response = client.filter.test(newDisplayName, data.base, data.filter, data.uncensor)

  if (response.censor) {
    var error
    try {
      await newMember.setNickname('')
    } catch (err) {
      console.log(`Shard ${client.shard.id} | ${oldMember.guild.name} ${oldMember.guild.id} ${err.message}`.red)
      error = 'Error! Missing permission to change nicknames!'
    }
    console.log(`Shard ${client.shard.id} | Changed innapropriate nickname of ${newMember.user} ${newMember.user.username}: `.yellow + `${newDisplayName}`.yellow.underline)
    client.c_log(`Shard ${client.shard.id} | Deleted oldMessage from ${oldMember.user.tag} ${oldMember.user.username}: | Server: ${oldMember.guild.name} ${oldMember.guild.id}`, client.embeds.adminLog(oldDisplayName, oldMember.user, {
      arg: response.arg,
      word: response.word
    }))
    var log = oldMember.guild.channels.get(data.log)
    if (!log) return
    log.send(client.embeds.log([oldDisplayName, newDisplayName], oldMember, response.method, 2, error, response))
    if (data.punishment.on) {
      console.log('punish')
      var role = oldMember.guild.roles.get(data.punishment.role)
      if (!role) return
      var user = await client.punishdb.find({ u: oldMember.user.id, g: oldMember.guild.id })
      if (!user) return client.punishdb.create(null, { u: oldMember.user.id, g: oldMember.guild.id, a: 1 })
      if (user.a + 1 >= data.punishment.amount) {
        oldMember.roles.add(role)
        client.punishdb.delete({ u: oldMember.user.id, g: oldMember.guild.id })
        var embed = new client.discord.MessageEmbed()
          .setTitle('User Punished')
          .setDescription(`${oldMember.user} Reached the max ${data.punishment.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
          .setColor('RED')
          .setFooter('This system is heavily WIP!')
        log.send(embed)
      } else {
        client.punishdb.add({ u: oldMember.user.id, g: oldMember.guild.id }, 'a', 1)
      }
    }
  }
}
