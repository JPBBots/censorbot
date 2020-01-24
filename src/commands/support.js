exports.run = async (client, message, args) => {
  message.delete()
  const msg = await message.reply("Support Server Sent to DM's")
  setTimeout(function () {
    msg.delete()
  }, 6000)
  message.author.send(client.config.support)
}
exports.info = {
  name: 'support',
  description: 'Sends invite to support server to DMs',
  format: '{prefix}support',
  aliases: ['s', 'server']
}
