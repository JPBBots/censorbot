exports.run = function (message, args) {
  this.send('`Invite me:` ' + this.config.inviteSite)
}
exports.info = {
  name: 'invite',
  description: 'Sends link to invite the bot',
  format: '{prefix}invite',
  aliases: ['inv']
}
