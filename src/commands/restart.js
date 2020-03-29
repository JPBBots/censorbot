exports.run = function (message, args) {
  this.delete()
  if (!args[0]) return process.exit()

  if (message.content.includes('-d')) {
    return this.client.killShard(args[1])
      .then(x => {
        this.send('Shard Destroyed and Restarted')
      })
      .catch(err => {
        this.send(`\`Error\`\n${err.message}`)
      })
  }

  const shard = this.client.shards.get(parseInt(args[0]))
  if (!shard) return this.send('Invalid Shard')

  shard.restart()
  this.send('Shard Killed and Resumed')
}

exports.info = {
  admin: true,
  aliases: [],
  name: 'restart'
}
