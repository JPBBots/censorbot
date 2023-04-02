import { Decorators, Symbols } from '@jadl/cmd'
import { Config } from '../../config'

export const AdminGuild = Decorators.createBaseDecorator(([], base) => {
  if (!Config.staging) {
    base[Symbols.guild] = Config.adminGuild
  }
})
