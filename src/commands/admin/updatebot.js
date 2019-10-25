exports.run = (client, message, args) => {
  client.user.setActivity(`For Bad Words | ${client.guilds.size} servers`, {
    type: 'WATCHING'
  })
  message.reply('updated')
}
exports.info = {
  name: 'updatebot',
  description: 'Updates bots status message.',
  format: '{prefix}updatebot'
}
