import { CommandOptions } from 'discord-rose'

export default {
  command: 'stats',
  description: 'Stats command',
  exec: async (ctx) => {
    const halfTrip = Date.now() - new Date(ctx.message.timestamp).getTime()

    const msg = await ctx.embed.title('Calculating...').send()

    const apiPing = Date.now() - new Date(msg.timestamp).getTime()

    let date = Date.now()

    const stats = await ctx.worker.comms.getStats()

    const internalPing = Date.now() - date

    date = Date.now()

    const deletedMessages: number = await ctx.worker.db.collection('stats').findOne({ id: 'deleted' }).then(x => x.amount)

    const dbPing = Date.now() - date

    const guildCount = stats.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.guilds, 0), 0)

    if (!ctx.guild) return
    const embed = ctx.embed
      .color(ctx.worker.responses.color)
      .title('Bot stats')
      .description(`Shard: ${ctx.worker.guildShard(ctx.guild.id).id}/${ctx.worker.options.shards}, Cluster: ${ctx.worker.comms.id}/${Math.ceil(ctx.worker.options.shards / ctx.worker.options.shardsPerCluster)}`)
      .field(':clock: Pings',
        `__WebSocket__: ${ctx.worker.guildShard(ctx.guild.id).ping}ms\n` +
        `__API/Rest__: ${apiPing}ms\n` +
        `__Trip__: ${halfTrip}ms/${new Date(msg.timestamp).getTime() - new Date(ctx.message.timestamp).getTime()}ms\n` +
        `__Database__: ${dbPing}ms\n` +
        `__Internal__: ${internalPing}ms`
      )
      .field('Servers', `${guildCount.toLocaleString()}`, true)
      .field('Memory', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB`, true)
      .field('Censored', `${deletedMessages.toLocaleString()}`)

    void ctx.worker.api.messages.edit(msg.channel_id, msg.id, { embed: embed.render(), allowed_mentions: { replied_user: false } })
  }
} as CommandOptions
