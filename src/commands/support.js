exports.run = function (message, args) {
  this.send(this.config.support)
}
exports.info = {
  name: 'support',
  description: 'Sends invite to support server',
  format: '{prefix}support',
  aliases: ['s', 'server']
}
