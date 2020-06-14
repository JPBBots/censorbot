exports.run = function (message, args) {
  this.send(`Check out the online settings dashboard here: ${this.config.dashboard}`)
}
exports.info = {
  name: 'dashboard',
  description: 'Gives link to the online settings dashboard',
  format: '{prefix}dashboard',
  aliases: ['dash', 'settings', 'config']
}
