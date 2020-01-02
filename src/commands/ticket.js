function createid () {
  var text = ''
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 3; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}
exports.run = async (client, message, args) => {
  const fs = require('fs')
  var banUser = await client.ticketerdb.getAll(message.author.id)
  if (banUser && banUser.banned) {
    const banno = await message.reply('Hello! We are sorry to inform you but you have been banned from using this feature! This was most likely caused by you abusing the command, if you would like to appeal or find out exactly why you were banned feel free to do ' + client.config.prefix + 'support and talk to the owner, Sorry! -' + client.config.name + ' Support Team')
    setTimeout(() => {
      banno.delete()
    }, 20000)
    return
  }
  if (!message.guild) {
    var sent = 'DMs'
  }
  if (message.guild) {
    var sent = `Server: ${message.guild.name} ${message.guild.id}`
  }
  const arg1 = args[0]
  const Discord = require('discord.js')
  if (!arg1) {
    const tickethelpembed = new Discord.MessageEmbed()
      .setDescription('Tickets are to request that a word be uncensored from the prebuilt filter!\n\nCreate a ticket: ' + client.config.prefix + 'ticket `Word`')
      .setColor('RANDOM')
      .setFooter('This Message Will Self Destruct in 10 Seconds! (Requested by ' + message.author.username + ')', client.user.avatarURL())
      .setTitle('Ticket System')
    const res = await message.channel.send(tickethelpembed)
    setTimeout(function () {
      res.delete()
    }, 10000)
    return
  }
  var content = args.join(' ')
  var response = await client.filter.test(content, true)
  if (response.censor == false) {
    const notcensorres = await message.reply("Ticket stopped! The automatic detection system found you tried to submit a ticket of a word that isn't censored! If this isn't true then please join the support server (" + client.config.prefix + 'support)!')
    setTimeout(function () {
      notcensorres.delete()
    }, 10000)
  } else {
    if (response.method == 'server') {
      const servercensored = await message.reply("Ticket stopped! We found that this word isn't censored by our filter but is censored by your servers custom filter! Do +filter for more information or contact an admin of THIS server.")
      setTimeout(function () {
        servercensored.delete()
      }, 10000)
    } else {
      const ticid = createid()
      const ticmsg = await client.msg('ticket', '',
        client.u.embed
          .setColor('ORANGE')
          .setTitle('Ticket')
          .setDescription(`From ${message.author}`)
          .addField('ID', ticid, true)
          .addField('Match Site', response.arg, true)
          .addField('Word', content)
      )

      client.ticketdb.create(ticid, {
        author: message.author.id,
        ticmsg: ticmsg.id,
        word: content
      })
      console.log('Ticket was sent!')
      const ticconfirm = new Discord.MessageEmbed()
        .setTitle('Ticket Submitted!')
        .setColor('RANDOM')
        .setDescription("We'll reach out to you soon telling you how it goes!")
        .setFooter('Ticket sent by ' + message.author.username + '!')
      const ticcsend = await message.channel.send(ticconfirm)
      setTimeout(() => {
        ticcsend.delete()
      }, 10000)
    }
  }
}
exports.info = {
  name: 'ticket',
  description: "Submits words that shouldn't be censored directly to owner/helpers",
  format: '{prefix}ticket [phrase/word that is censored]'
}
