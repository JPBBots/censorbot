exports.run = async function (message, args) {
  const clusters = await this.client.cluster.internal.shardStats()

  const embed = this.embed
    .title('Shard Stats')
    .timestamp()

  for (let i = 0; i < clusters.length; i++) {
    embed.field(
      `Cluster ${i} | RAM: ${((clusters[i].cluster.memory) / 1024 / 1024).toFixed(0) + ' MB'} | ${(clusters[i].shards.reduce((a, b) => a + b.ping, 0) / clusters[i].shards.length).toFixed(0)}ms`,
      clusters[i].shards.map(x =>
        `${x.connected ? ':white_check_mark:' : ':x:'} Shard ${x.id} | ${x.guilds} servers. ${x.id === this.client.guildShard(this.guild.id) ? ':arrow_backward:' : ''}`
      ).join('\n') + `\n\n${clusters[i].shards.reduce((a, b) => a + b.events, 0)} events/minute\n` +
      `${clusters[i].shards.reduce((a, b) => a + b.guilds, 0)} servers`
    )
  }

  embed.field('Total',
    `RAM Usage: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB\n` +
    `Events: ${clusters.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.events, 0), 0).toLocaleString()} events/minute\n` +
    `Ping: ${(clusters.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.ping, 0), 0) / clusters.reduce((a, b) => a + b.shards.length, 0)).toFixed(0)}ms\n` +
    `Servers: ${clusters.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.guilds, 0), 0).toLocaleString()}`
  )

  this.invokeCooldown()

  this.send(embed)
}
exports.info = {
  name: 'shards',
  description: 'Shows shard info',
  cooldown: 1,
  format: '{prefix}shards',
  aliases: []
}
