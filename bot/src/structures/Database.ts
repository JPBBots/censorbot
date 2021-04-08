import { Config } from '../config'
import { Cache } from 'discord-rose/dist/utils/Cache'

import { GuildDB } from 'typings/api'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

import { schema } from '../data/ConfigSchema'

import { Database as Db } from 'interface/dist/Database'

export class Database extends Db {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  defaultConfig = DefaultConfig
  safeConfig = SafeConfig

  schema = schema

  constructor () {
    super(Config.db.host, Config.db.username, Config.db.password)
  }

  async config (id: Snowflake): Promise<GuildDB> {
    if (this.db == null) return SafeConfig as unknown as GuildDB

    const cached = this.configCache.get(id)
    if (cached != null) return cached

    const db = (await this.collection('guild_data').findOne({ id }) as GuildDB) || Object.assign({ id }, DefaultConfig) as GuildDB

    this.configCache.set(id, db)

    return db
  }

  async guildPremium (id: Snowflake): Promise<boolean> {
    const response = await this.collection('premium_users').find({
      guilds: {
        $elemMatch: { $eq: id }
      }
    }).toArray()
      .then(x => x.length)

    return response > 0
  }
}
