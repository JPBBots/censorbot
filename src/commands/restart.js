exports.run = function (message, args) {
  this.delete()
  if (!args[0]) return process.exit()

  const shard = this.client.shards.get(parseInt(args[0]))
  if (!shard) return this.send('Invalid Shard')

  shard.restart()
}

exports.info = {
  admin: true,
  aliases: [],
  name: 'restart'
}
