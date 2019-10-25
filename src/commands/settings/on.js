var convert = {
  all: 'All Filters',
  msg: 'Messages',
  emsg: 'Edited Messages',
  nick: 'Nicknames',
  react: 'Reactions'
}

exports.run = async (client, message, args, db) => {
  message.delete()
  // return message.reply("This command is currently being reworked. Please wait!")
  const logc = await db.get('log')
  if (!logc) {
    client.sendErr(message, 'Error, please set a log channel before toggling the filter! (' + client.config.prefix + 'setlog)')
    return
  }

  if (!args[0]) {
    var str = []
    Object.keys(convert).forEach(k => {
      str.push(`${convert[k]}: \`${k}\``)
    })
    str = str.join('\n')
    return message.channel.send(
      client.u.embed
        .setColor('ORANGE')
        .setTitle('Missing argument')
        .setDescription(`Please ${client.config.prefix}on \`filter\`
                
                Filters:
                ${str}`)
    )
  }
  args[0] = args[0].toLowerCase()

  const k = await db.get('censor')

  if (!Object.keys(convert).includes(args[0])) { return client.sendErr(message, `Error, invalid filter to toggle, please choose from ${Object.keys(convert).join(', ')}`) }

  if (k[args[0]] === true) return client.sendErr(message, 'This filter is already toggled on!')

  var obj = {}
  if (args[0] === 'all') {
    obj = {
      msg: true,
      emsg: true,
      nick: true,
      react: true
    }
  } else {
    obj[args[0]] = true
  }

  var res = await client.sendSettings(message, [`Filter Toggle (${convert[args[0]]} Filter)`, 'OFF', 'ON'], [`Successfully toggled the ${convert[args[0]]} Filter on!`, 'Filter Toggled by ' + message.author.username])
  if (res == 200) {
    db.set('censor', obj)
    console.log(`Shard ${client.shard.id} | Turned On Filter for ${message.guild.name}`.grey)
  } else return console.log('Error: ' + res)
}
exports.info = {
  name: 'on',
  description: 'Turns on the base filter',
  format: '{prefix}on'
}
