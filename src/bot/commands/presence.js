exports.run = function (message, args) {
  this.client.cluster.internal.setPresence(args[0])
  this.send(':ok_hand:')
}

exports.info = {
  name: 'presence',
  description: 'Controls presence',
  aliases: [],
  admin: true
}
