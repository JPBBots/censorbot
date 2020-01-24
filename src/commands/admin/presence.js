exports.run = async (client, message, args) => {
  const arg1 = args[0]
  if (!arg1) {
    const embed = client.u.embed
      .setTitle('Presences')
      .setFooter(`Current: ${client.p}`)
      
    for (const key of Object.keys(client.presences)) {
      embed.addField(key, `\`\`\`js\n${JSON.stringify(await client.presences[key](), null, 4)}\`\`\``)
    }
    return message.channel.send(embed)
  }
  if (arg1 === 'set') {
    const msg = args.slice(1)
    client.shard.broadcastEval(`this.presences.custom = async () => { return { activity: { name: "${msg}" } } }; this.p = 'custom'; this.setPresence()`)
    return message.reply(':ok_hand:')
  }
  if (!client.presences[arg1]) return message.reply('doesn\'t exist')
  
  client.shard.broadcastEval(`this.p = "${arg1}"; this.setPresence()`)
    .then(() => {
      message.reply(':ok_hand:')
    })
}
exports.info = {
  name: 'presence',
  description: 'Sets bot presence ',
  format: '{prefix}presence [presence number]'
}
