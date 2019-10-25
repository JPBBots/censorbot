exports.run = async (client, message, args) => {
  const fs = require('fs')
  message.delete()
  const arg1 = args[0]
  let arg2 = args[1]
  if (!arg1) return
  if (!arg2) return

  arg2 = arg2.split(',')
  const author = message.mentions.users.first() || message.author
  arg2.forEach(async arg2 => {
    const ticketid = arg2
    const ticketfile = await client.ticketdb.getAll(ticketid)
    const ticketsender = await client.users.fetch(ticketfile.author, false)
    const wordgo = ticketfile.word
    var y = ''
    if (arg1 == 'yes') {
      try {
        ticketsender.send(`Hey! Thank you for your ticket on the word \`\`\`\n${wordgo.replace(/{n}/gi, '\n')}\`\`\`! After evaluation with the team we have come to the conclusion of the word no longer being censored! Thank you for reporting and thanks again for using ${client.config.name}! -${client.config.name} Support Team (Ticket Accepted By ${message.author.username})`)
        console.log('Accept')
      } catch (err) {
        const msg = await message.reply('Error, user has DMs disabled or is no longer in a server containing the bot!')
        setTimeout(function () {
          msg.edit(':boom:')
          setTimeout(function () {
            msg.delete()
          }, 500)
        }, 5000)
      }
    }
    if (arg1 == 'no') {
      var ticketUser = await client.ticketerdb.getAll(ticketfile.author)
      if (!ticketUser) {
        await client.ticketerdb.create(ticketfile.author, {
          banned: false,
          no: 0
        })
        ticketUser = await client.ticketerdb.getAll(ticketfile.author)
      }
      var warning = ticketUser.no + 1
      client.ticketerdb.set(ticketfile.author, 'no', warning)
      if (warning > 2) {
        message.channel.send(
          client.u.embed
            .setTitle('Ban')
            .setDescription(`This user has ${warning} warnings. Ban suggested (${ticketfile.author}`)
            .addField('id', ticketfile.author)
        )
      }
      try {
        ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word \`\`\`\n${wordgo.replace(/{n}/gi, '\n')}\`\`\` was denied! Sorry, If you believe this was a mistake be sure to join the support server (${client.config.prefix}support) and message the person who denied your ticket (listed at the end of this response). -${client.config.name} Support Team (Ticket Denied By ${author.username})`)
        console.log('Deny')
      } catch (err) {
        const msg = await message.reply('Error, user has DMs disabled or is no longer in a server containing the bot!')
        setTimeout(function () {
          msg.edit(':boom:')
          setTimeout(function () {
            msg.delete()
          }, 500)
        }, 5000)
      }
    }
    if (arg1 == 'notcensor') {
      try {
        ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word \`\`\`\n${wordgo.replace(/{n}/gi, '\n')}\`\`\` was denied because it was not censored! Chances are you either typed the word wrong and set it off or ${client.config.name} was dealing with some difficulties, sorry! -${client.config.name} Support Team (Denied by ${author.username})`)
        console.log('CDeny')
      } catch (err) {
        const msg = await message.reply('Error, user has DMs disabled or is no longer in a server containing the bot!')
        setTimeout(function () {
          msg.edit(':boom:')
          setTimeout(function () {
            msg.delete()
          }, 500)
        }, 5000)
      }
    }
    const ticmsg = await client.channels.get('509886529729200128').messages.fetch(ticketfile.ticmsg)
    ticmsg.delete()
    client.ticketdb.delete(ticketid)
    client.msg('ticketLog', '',
      client.u.embed
        .setColor(arg1 === 'no' ? 'RED' : arg1 === 'yes' ? 'GREEN' : 'BLUE')
        .setTitle('Ticket Response')
        .setDescription(`${author} responded \`${arg1}\` to ${ticketsender} (${(ticketsender || {}).username})`)
        .addField('Warnings', warning, true)
        .addField('Ticket ID', ticketid, true)
        .addField('Word', wordgo)
    )
  })
}
exports.info = {
  name: 'tr',
  description: 'Interacts with given ticket',
  format: '{prefix}tr [opt] [ticid]'
}
