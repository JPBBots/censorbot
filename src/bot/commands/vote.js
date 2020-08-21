exports.run = function (message, args) {
  this.send(`Vote for ${this.client.user.username} here! https://top.gg/bot/${this.client.user.id}/vote`)
}
exports.info = {
  name: 'vote',
  description: 'Gives link to vote for {name}',
  format: '{prefix}vote',
  aliases: ['v']
}
