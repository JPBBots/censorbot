exports.run = async (client, message, args) => {
  const fs = require('fs')
  message.delete()
  if (args[0]) return [client.restartShard(args[0]), message.reply('Restarted shard ' + args[0])]
  const Discord = require('discord.js')
  const a = new Discord.MessageEmbed()
    .setTitle('Restarting... Please wait. ')
    .setColor('DARK_GOLD')
    .setFooter('Command ran by ' + message.author.username)
  const o = await message.channel.send(a)
  fs.writeFile('./r.json', `{"chan": "${o.channel.id}", "mes": "${o.id}", "us": "${message.author.id}", "shard": "${client.shard.id}"}`, (error) => {
    process.exit()
  })
}
exports.info = {
  name: 'restart',
  description: 'Restarts the bot',
  format: '{prefix}restart'
}
