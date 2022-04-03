import { Cache } from '@jpbberry/cache'
import { Injectable } from '@nestjs/common'
import { Snowflake } from 'jadl'
import { GuildData, ShortGuild, User } from 'typings'
import { Config } from '../../config'

@Injectable()
export class CacheService {
  constructor() {
    if (Config.staging) {
      global.cache = this
    }
  }

  users: Cache<Snowflake, User> = new Cache(Config.dashboardOptions.wipeTimeout)

  meta: Cache<'serverCount', number> = new Cache(
    Config.dashboardOptions.wipeTimeout
  )

  userGuilds: Cache<Snowflake, ShortGuild[]> = new Cache(
    Config.dashboardOptions.wipeTimeout
  )

  guilds: Cache<Snowflake, GuildData> = new Cache(
    Config.dashboardOptions.wipeTimeout
  )

  clear() {
    this.users.clear()
    this.meta.clear()
    this.userGuilds.clear()
    this.guilds.clear()
  }
}
