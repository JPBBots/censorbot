const { table } = require('table')

exports.run = async function (message, args) {
  const clusters = await this.client.cluster.internal.shardStats()

  let msg = ''

  for (let i = 0; i < clusters.length; i++) {
    msg += `Cluster ${i} | RAM: ${((clusters[i].cluster.memory) / 1024 / 1024).toFixed(0) + ' MB'}\n`

    const arr = [['Shard', 'State', 'Ping', 'Guilds']]
    clusters[i].shards.forEach(shard => {
      arr.push([shard.id, shard.connected ? 'Connected' : 'Disconnected', shard.ping + 'ms', shard.guilds])
    })

    arr.push(['Total', '', (clusters[i].shards.map(x => x.ping).reduce((a, b) => a + b, 0) / clusters[i].shards.length).toFixed(0) + 'ms', clusters[i].shards.map(x => x.guilds).reduce((a, b) => a + b, 0)])

    msg += table(arr)
  }

  this.send('```\n' +
    `${msg}\nCurrent: Cluster ${this.client.cluster.id} | Shard ${this.client.guildShard(message.guild_id)}` +
  '```')
}
exports.info = {
  name: 'shards',
  description: 'Shows shard info',
  format: '{prefix}shards',
  aliases: []
}
