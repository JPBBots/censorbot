exports.run = async function (message, args) {
  this.client.cluster.internal.reload(args[0])

  this.send(':ok_hand:')
}

exports.info = {
  name: 'reload',
  description: 'Reloads certain parts',
  format: '{prefix}reload [part]',
  aliases: ['r'],
  admin: true
}
