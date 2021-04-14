import { CommandOptions } from 'discord-rose'

export default {
  command: 'restart',
  admin: true,
  exec: async (ctx) => {
    if (ctx.flags.ws) {
      ctx.worker.comms.tell('RELOAD_WEBSOCKETS', null)
      return
    }

    await ctx.worker.comms.restartCluster(ctx.args[0].toUpperCase())

    void ctx.reply('Restarted')
  }
} as CommandOptions
