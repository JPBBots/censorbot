module.exports = async(client, message) => {
  if (!message.guild_id || !message.member || (message.author && message.author.bot)) return
  
  const channel = client.channels.get(message.channel_id)
  if (channel && channel.nsfw) return

  const data = await client.rdb.getAll(message.guild_id)

  if (!data.censor.emsg) return
  if (data.role && message.member.roles.includes(data.role)) return

  const response = await client.filter.test(message.content, data.base, data.filter, data.uncensor)

  if (response.censor) {
    let error
    try {
      await client.api
        .channels[message.channel_id]
        .messages[message.id]
        .delete()
    }
    catch (err) {
      console.log(`Shard ${client.shard.id} | ${message.guild_id} ${error.message}`.red)
      error = 'Error! Missing permission to manage messages!'
    }

    if (data.msg !== false) {
      try {
        const popmsg = await client.api
          .channels[message.channel_id]
          .messages
          .post({
            data: {
              content: `<@${message.author.id}> ${data.msg || client.config.defaultMsg}`
            }
          })
        if (data.pop_delete) {
          setTimeout(() => {
            client.api
              .channels[message.channel_id]
              .messages[popmsg.id]
              .delete()
          }, data.pop_delete)
        }
      }
      catch (err) {
      }
    }
    console.log(`Shard ${client.shard.id} | Deleted message from ${message.author} ${message.author.username}: `.yellow + `${message.content}`.yellow.underline)
    var content = ''
    if (message.content !== 0) {
      if (message.content.length > 256) {
        content = 'Message too long to include in embed!'
      } else {
        content = message.content
      }
    }
    client.c_log(`Shard ${client.shard.id} | Deleted oldMessage from ${message.author.id} ${message.author.username}: | Server: ${message.guild_id} | Channel: ${message.channel_id}`, client.embeds.adminLog(content, message.author, {
      arg: response.arg,
      word: response.word
    }))
    
    const log = client.channels.get(data.log)
    if (log) log.send(client.embeds.log(message.content, message, response.method, 1, error, response))
    
    client.punishments.addOne(message.guild_id, message.author.id, data)
  }
}
