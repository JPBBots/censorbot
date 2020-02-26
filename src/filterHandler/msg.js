module.exports = async(client, message) => {
  if (message.guild && message.guild.id == '264445053596991498') return
  var prefix = message.content.startsWith(client.config.prefix) ? client.config.prefix :
    message.content.startsWith('<@')
  if (message.guild.id == '264445053596991498' && message.content.startsWith(client.config.prefix)) return
  if (message.content.startsWith(client.config.prefix)) prefix = client.config.prefix
  else if (message.content.startsWith('<@')) {
    if (message.content.startsWith('<@!')) prefix = `<@!${client.user.id}> `
    else prefix = `<@${client.user.id}> `
  }
  if (prefix) {
    const args = message.content.slice(prefix.length).split(' ')
    const command = args.shift().toLowerCase()
    if (client.config.delc.includes(command)) return message.delete().catch(() => {})
  }
  if (message.channel.nsfw) return
  const attachments = message.attachments.map(x => x.name)
  if (attachments.length > 0) {
    attachments.forEach(a => {
      message.content += ` ${a.replace(/(_|\.)/g)}`
      // arg.push(a.replace(/(_|\.)/g, " "))
    })
  }
  var data = await client.rdb.getAll(message.guild.id)
  if (!data) {
    var newConfig = new client.config.serverConfig(message.guild.id)
    client.rdb.create(message.guild.id, newConfig)
    data = newConfig
  }
  if (data.role && message.member.roles.has(data.role)) return
  if (data.channels && data.channels.includes(message.channel.id)) return
  if (!data.censor.msg) return

  let content = ""

  const multi = client.multilines.get(message.channel.id)

  if (data.multi) {
    if (multi) {
      if (multi.user !== message.author.id) {
        client.multilines.delete(message.channel.id)
      }
      else {
        content += multi.content
        multi.content += message.content
        multi.messages.push(message.id)
        client.multilines.set(message.channel.id, multi)
      }
    }
    else {
      client.multilines.set(message.channel.id, {
        user: message.author.id,
        content: message.content,
        messages: [message.id]
      })
    }
  }

  content += message.content

  var response
  if (client.serverFilters[message.guild.id]) response = client.serverFilters[message.guild.id].test(content, true, data.filter, data.uncensor)
  else response = await client.filter.test(content, data.base, data.filter, data.uncensor)

  if (response.censor) {
      var msg = message
    if (multi && multi.messages.length > 1) {
      client.multilines.delete(message.channel.id)
      
      client.api
        .channels[message.channel.id]
        .messages("bulk-delete")
        .post({
          data: {
            messages: multi.messages
          }
        })
    }
    else {
      var error
      try {
        await msg.delete()
      }
      catch (err) {
        console.log(`Shard ${client.shard.id} | ${msg.guild.name} ${msg.guild.id} ${err.message}`.red)
        error = 'Error! Missing permission to manage messages!'
      }
    }
    if (data.msg !== false) {
      try {
        const popmsg = await message.reply(data.msg || client.config.defaultMsg)
        if (data.pop_delete) {
          setTimeout(() => {
            popmsg.delete()
          }, data.pop_delete)
          if (data.antighostping && msg.mentions.users.first() && !(msg.mentions.users.size == 1 && msg.mentions.users.first().bot)) {
            msg.channel.send(`ANTI-GHOSTPING:::Attention ${msg.mentions.users.filter(b => !b.bot).map(x => x.tag).join(' ')} you might've been ghost pinged by ${msg.author} (Don't want this message. Run +agp)`)
          }
        }
      }
      catch (err) {
      }
    }
    console.log(`Shard ${client.shard.id} | Deleted message from ${msg.author} ${msg.author.username}: `.yellow + `${msg.content}`.yellow.underline)
    if (content !== 0) {
      if (content.length > 256) {
        content = 'Message too long to include in embed!'
      }
    }
    if (msg.attachments.map(x => x.name).length > 0 && msg.content == 0) {
      content = 'File: ' + msg.attachments.map(x => x.name)[0]
    }
    client.webhooks.log.send(`Shard ${client.shard.id} | Deleted message from ${msg.author.tag} ${msg.author.username}: | Server: ${msg.guild.name} ${msg.guild.id} | Channel: ${msg.channel.name} ${msg.channel.id}`, client.embeds.adminLog(content, msg.author, {
      arg: response.arg,
      word: response.word
    }))
    var log
    if (data.log) {
      log = msg.guild.channels.get(data.log)
      if (log) log.send(client.embeds.log([content], msg, response.method, 0, error, response))
    }
    client.punishments.addOne(message.guild.id, message.author.id, data)
    if (data.webhook) {
      var send = 'Contains curse: \n' + '||' + content.replace(/\`\`\`/gi, '').replace(/\|/g, '') + '||'
      client.u.sendAsWebhook(msg.author, msg.channel, send)
    }
  }
}
