import { CommandOptions } from 'discord-rose'

export default {
  command: 'stats',
  description: 'Stats command',
  exec: async (ctx) => {
    let date = Date.now()

    await ctx.typing()

    const apiPing = Date.now() - date

    date = Date.now()

    const stats = await ctx.worker.comms.getStats()

    const internalPing = Date.now() - date

    date = Date.now()

    const deletedMessages: number = await ctx.worker.db.collection('stats').findOne({ id: 'deleted' }).then(x => x.amount)

    const dbPing = Date.now() - date

    const guildCount = stats.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.guilds, 0), 0)

    if (!ctx.guild) return
    void ctx.embed
      .color(ctx.worker.responses.color)
      .title('Bot stats')
      .description(`Shard: ${ctx.worker.guildShard(ctx.guild.id).id}, Cluster: ${ctx.worker.comms.id}`)
      .field(':clock: Pings',
        `__WebSocket__: ${ctx.worker.guildShard(ctx.guild.id).ping}ms\n` +
        `__API/Rest__: ${apiPing}ms\n` +
        `__Database__: ${dbPing}ms\n` +
        `__Internal__: ${internalPing}ms`
      )
      .field('Servers', `${guildCount.toLocaleString()}`, true)
      .field('Memory', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB`, true)
      .field('Censored', `${deletedMessages.toLocaleString()}`)
      .send()
  }
} as CommandOptions
