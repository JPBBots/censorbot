exports.run = async function (message, args) {
  // this.delete()

  // const destroy =

  // if (message.content.includes('-d')) return this.client.cluster.internal.restart(args[1], true)

  // const shard = this.client.shards.get(parseInt(args[0]))

  // shard.restart()
  // this.send('Shard Killed and Resumed')
}

exports.info = {
  admin: true,
  description: 'Restart',
  aliases: [],
  name: 'restart'
}
