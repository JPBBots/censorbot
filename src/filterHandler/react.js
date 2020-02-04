module.exports = async(client, reaction) => {
  if (reaction.member.user.bot) return
  const channel = client.channels.get(reaction.channel_id)
  if (channel && channel.nsfw) return

  const data = await client.rdb.getAll(reaction.guild_id)

  if (!data.censor.react) return

  if (data.role && reaction.member.roles.includes(data.role)) return

  const response = await client.filter.test(reaction.emoji.name, data.base, data.filter, data.uncensor)
  
  if (response.censor) {
    let error
    try {
      await client.api
        .channels[reaction.channel_id]
        .messages[reaction.message_id]
        .reactions[reaction.emoji.id ? `e:${reaction.emoji.id}` : encodeURIComponent(reaction.emoji.name)]
        (reaction.user_id)
        .delete()
    } catch (err) {
      console.log(`Shard ${client.shard.id} | ${reaction.guild_id} ${err.message}`.red)
      error = 'Error! Missing permission to manage messages!'
    }
    
    console.log(`Shard ${client.shard.id} | Removed reaction from ${reaction.user_id} ${reaction.member.user.username}: `.yellow + `${reaction.emoji.name}`.yellow.underline)
    
    const log = client.channels.get(data.log)
    if (log) log.send(client.embeds.log([reaction.emoji.name, reaction.emoji.id ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}` : ''], reaction, response.method, 3, error))
    
    client.punishments.addOne(reaction.guild_id, reaction.user_id, data)
  }
}
