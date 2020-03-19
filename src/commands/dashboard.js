exports.run = function (message, args) {
  this.send('Check out the online settings dashboard here: https://censorbot.jt3ch.net/dash')
}
exports.info = {
  name: 'dashboard',
  description: 'Gives link to the online settings dashboard',
  format: '{prefix}dashboard',
  aliases: ['dash']
}
