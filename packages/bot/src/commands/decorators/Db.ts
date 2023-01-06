import { Decorators } from '@jadl/cmd'
import { Snowflake } from 'discord-api-types/v9'
import { WorkerManager } from '../../managers/Worker'

export const Db = Decorators.createParameterDecorator(() => {
  return async (interaction, { worker }) => {
    return await (worker as WorkerManager).db.config(
      interaction.guild_id as Snowflake
    )
  }
})
