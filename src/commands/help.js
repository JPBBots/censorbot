exports.run = async (client, message, args) => {
  message.delete()
  const Discord = require('discord.js')
  let helpstring = ''
  const cmds = client.commands.filter(x => !(x.info.setting && !['settings', 'setlog'].includes(x.info.name))).map(x => x.info.name).sort().map(x => client.commands.get(x).info)
  for (var i = 0; i < cmds.length; i++) {
    if (cmds[i].admin) continue
    helpstring += `__${client.config.prefix}${cmds[i].name}__: ${cmds[i].description.replace('{name}', client.config.name).replace('{prefix}', client.config.prefix)}\n`
  }
  const helpmsg = await message.channel.send(client.u.embed
    .setDescription(helpstring)
    .setColor('RANDOM')
    .addField('Links', `[Support Server](${client.config.support}) | [Patreon](${client.config.patreon}) | [Direct Donate](${client.config.donate}) | [Website](${client.config.website})
        [Invite](${client.config.invitesite}) | [Dashboard](${client.config.dashboard}) | [Discord Bot List](${client.config.dbl})`)
    .setFooter('This Message Will Self Destruct in 30 Seconds!', client.user.avatarURL())
    .setTitle('Hello and Thank You For Using ' + client.config.name + '!')
  )
  setTimeout(function () {
    helpmsg.edit(':boom:')
    setTimeout(function () {
      helpmsg.delete()
    }, 5000)
  }, 25000)
}
exports.info = {
  name: 'help',
  description: 'Displays this list',
  format: '{prefix}help',
  aliases: ['h']
}
