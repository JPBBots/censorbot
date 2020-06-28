exports.run = async function (message, args) {
  if (!args[0]) return this.send('Usage: +restart [worker]')
  const { success } = await this.client.cluster.internal.killCluster(args[0])
  if (!success) return this.send('Error')
  this.send(':ok_hand:')
}

exports.info = {
  admin: true,
  description: 'Restart',
  aliases: [],
  name: 'restart'
}
