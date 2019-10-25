exports.run = (client, message, args) => {
  if (args[0] === '.') args[0] = message.guild.id
  if (!args[0] || !args[1] || !['on', 'off'].includes(args[1])) return message.reply('Format: `+setpremium [guildID] [on/off]`')
  var toggle = args[1].toLowerCase() == 'on'
  if (toggle) {
    client.pdb.create(args[0], { premium: true })
    message.reply(`Set ${args[0]} premium on`)
  } else {
    client.pdb.delete(args[0])
    message.reply(`Set ${args[0]} premium off`)
  }
}

exports.info = {
  name: 'setpremium',
  description: "Set's premium for a server",
  usage: '{prefix}setpremium'
}
