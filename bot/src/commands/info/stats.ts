import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'stats',
  description: 'Stats command',
  exec: async (ctx) => {
    const date = Date.now()

    await ctx.typing()

    const apiPing = Date.now() - date

    ctx.embed
      .title('Bot stats')
      .field(':envelope_with_arrow: Ping', `${ctx.worker.guildShard(ctx.guild.id).ping}ms`, true)
      .field(':incoming_envelope: API Latency', `${apiPing}ms`, true)
      .send()
  }
} as CommandOptions
