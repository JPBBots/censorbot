exports.run = async (client, message, args, db) => {
  const r = await db.get('antighostping')
  if (r) {
    var res = await client.sendSettings(message, ['Anti-GhostPing', 'ON', 'OFF'], ['Successfully toggled Anti-GhostPing OFF', 'Set by ' + message.author.username])
    if (res == 200) {
      db.set('antighostping', false)
    } else return console.log('Error: ' + res)
  } else {
    var res = await client.sendSettings(message, ['Anti-GhostPing', 'OFF', 'ON'], ['Successfully toggled Anti-GhostPing ON', 'Set by ' + message.author.username])
    if (res == 200) {
      db.set('antighostping', true)
    } else return console.log('Error: ' + res)
  }
}
exports.info = {
  name: 'agp',
  description: 'Anti-GhostPing, prevent ping messages that get instantly removed for cursing, WhO pInGeD mE?',
  format: '{prefix}agp',
  aliases: ['antighostping']
}
