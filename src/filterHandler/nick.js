module.exports = async(client, member) => {
  if (!member.nick || member.user.bot) return

  const data = await client.rdb.getAll(member.guild_id)

  if (!data) return

  if (!data.censor.nick) return
  if (data.role && member.roles.includes(data.role)) return

  const response = await client.filter.test(member.nick, data.base, data.filter, data.uncensor)

  if (response.censor) {
    var error
    try {
      await client.api
        .guilds[member.guild_id]
        .members[member.user.id]
        .patch({
          data: {
            nick: ""
          }
        })
    }
    catch (err) {
      console.log(`Shard ${client.shard.id} | ${member.guild_id} ${err.message}`.red)
      error = 'Error! Missing permission to change nicknames!'
    }
    console.log(`Shard ${client.shard.id} | Changed innapropriate nickname of ${member.user.id} ${member.user.username}: `.yellow + `${member.nick}`.yellow.underline)
    client.c_log(`Shard ${client.shard.id} | Changed inap nickname of ${member.user.username}#${member.user.discriminator} | Server: ${member.guild_id}`, client.embeds.adminLog(member.nick, member.user, {
      arg: response.arg,
      word: response.word
    }))
    var log 
    if(data.log) {
      log = client.channels.get(data.log)
      if (log) log.send(client.embeds.log([member.nick], member, response.method, 2, error, response))
    }
    
    client.punishments.addOne(member.guild_id, member.user.id, data)
  }
}
