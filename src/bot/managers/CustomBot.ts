import { CustomBotOptions } from '@censorbot/typings'
import { WorkerManager } from './Worker'

export class CustomBot extends WorkerManager {
  customBot: CustomBotOptions

  constructor() {
    super()

    this.db.on('started', async () => {
      const bot = await this.db
        .collection('custombots')
        .findOne({ token: this.options.token })

      if (!bot) throw new Error('No bot')

      this.customBot = bot

      this.config.custom = {
        on: true,
        lock: false,
        allowedGuilds: bot.guilds,
        status: bot.customStatus
      }

      this.setStatus(bot.customStatus[0], bot.customStatus[1])
    })
  }

  isCustom(_guildId?: string): boolean {
    return false
  }
}
