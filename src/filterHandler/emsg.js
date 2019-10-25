module.exports = async (client, oldMessage, newMessage) => {
  if (oldMessage.guild && oldMessage.guild.id == '264445053596991498') return
  if (oldMessage.channel.nsfw) return
  var data = await client.rdb.getAll(oldMessage.guild.id)
  if (data.role && newMessage.member.roles.has(data.role)) return
  if (!data.censor.emsg) return

  var response
  if (client.serverFilters[newMessage.guild.id]) response = client.serverFilters[newMessage.guild.id].test(newMessage.content, true, data.filter, data.uncensor)
  else response = client.filter.test(newMessage.content, data.base, data.filter, data.uncensor)

  if (response.censor) {
    var msg = newMessage
    var error
    try {
      await msg.delete()
    } catch (err) {
      console.log(`Shard ${client.shard.id} | ${msg.guild.name} ${msg.guild.id} ${error.message}`.red)
      error = 'Error! Missing permission to manage messages!'
    }
    if (newMessage.guild.id == '448194623580667916') {
      newMessage.author.send(
        client.u.embed
          .setColor('RED')
          .setTitle('Your message was deleted in Krunker Bunker')
          .setDescription('Please ping <@142408079177285632> if you believe this was a mistake')
          .addField('Message', newMessage.content)
          .setTimestamp()
      )
    }

    if (data.msg !== false) {
      try {
        const popmsg = await oldMessage.reply(data.msg || client.config.defaultMsg)
        if (data.pop_delete) {
          setTimeout(() => {
            popmsg.delete()
          }, data.pop_delete)
          if (data.antighostping && msg.mentions.users.first() && !(msg.mentions.users.size == 1 && msg.mentions.users.first().bot)) {
            msg.channel.send(`ANTI-GHOSTPING:::Attention ${msg.mentions.users.filter(b => !b.bot).map(x => x.tag).join(' ')} you might've been ghost pinged by ${msg.author} (Don't want this message. Run +agp)`)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    console.log(`Shard ${client.shard.id} | Deleted message from ${msg.author} ${msg.author.username}: `.yellow + `${msg.content}`.yellow.underline)
    var content = ''
    if (msg.content !== 0) {
      if (msg.content.length > 256) {
        content = 'Message too long to include in embed!'
      } else {
        content = msg.content
      }
    }
    if (msg.attachments.map(x => x.name).length > 0 && msg.content == 0) {
      content = 'File: ' + msg.attachments.map(x => x.name)[0]
    }
    client.c_log(`Shard ${client.shard.id} | Deleted oldMessage from ${msg.author.tag} ${msg.author.username}: | Server: ${msg.guild.name} ${msg.guild.id} | Channel: ${msg.channel.name} ${msg.channel.id}`, client.embeds.adminLog(content, msg.author, {
      arg: response.arg,
      word: response.word
    }))
    var log = msg.guild.channels.get(data.log)
    if (!log) {
      return client.sendErr(msg, 'Error no log channel found! Do +setlog in the desired log channel')
    }
    log.send(client.embeds.log([oldMessage.content, newMessage.content], msg, response.method, 1, error, response))
    if (data.punishment.on) {
      console.log('punish')
      var role = msg.guild.roles.get(data.punishment.role)
      if (!role) return
      var user = await client.punishdb.find({ u: msg.author.id, g: msg.guild.id })
      if (!user) return client.punishdb.create(null, { u: msg.author.id, g: msg.guild.id, a: 1 })
      if (user.a + 1 >= data.punishment.amount) {
        msg.member.roles.add(role)
        client.punishdb.delete({ u: msg.author.id, g: msg.guild.id })
        var embed = new client.discord.MessageEmbed()
          .setTitle('User Punished')
          .setDescription(`${msg.author} Reached the max ${data.punishment.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
          .setColor('RED')
          .setFooter('This system is heavily WIP!')
        log.send(embed)
      } else {
        client.punishdb.add({ u: msg.author.id, g: msg.guild.id }, 'a', 1)
      }
    }
    if (data.webhook) {
      var content = 'Contains curse: \n' + '||' + newMessage.content.replace(/\`\`\`/gi, '') + '||'
      client.u.sendAsWebhook(msg.author, msg.channel, content)
    }
  }
}
