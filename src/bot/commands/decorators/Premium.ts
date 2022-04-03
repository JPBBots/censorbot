import { CommandError, Decorators } from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import { Config } from '../../config'
import { WorkerManager } from '../../managers/Worker'

export const Premium = Decorators.createCommandDecorator((_, cmd) => {
  cmd.canRun.push(async (int, handler) => {
    if (!int.guild_id) return false

    const isPremium = (
      await (handler.worker as WorkerManager).db.guildPremium(int.guild_id)
    ).premium

    if (!isPremium)
      throw new CommandError(
        new Embed().description(
          `This server must have [premium](${Config.links.premium}) in order to use this command`
        )
      )

    return isPremium
  })
})
