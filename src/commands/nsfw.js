exports.run = async (client, message, args) => {
  message.delete()
  if (!message.member.hasPermission('MANAGE_CHANNELS')) return client.sendErr(message, 'You need the Manage Channels permission to do this!')
  if (message.channel.nsfw) {
    message.channel.setNSFW(false, `Done by ${message.author.tag}`)
    client.sendSuccess(message, 'Successfully turned NSFW off.', `Toggled by ${message.author.tag}`)
  } else {
    message.channel.setNSFW(true, `Done by ${message.author.tag}`)
    client.sendSuccess(message, 'Successfully turned NSFW on.', `Toggled by ${message.author.tag}`)
  }
}
exports.info = {
  name: 'nsfw',
  description: "Toggle NSFW on current channel, (Primarily for iOS users that can't do it natively)",
  format: '{prefix}nsfw'
}
