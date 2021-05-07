import { Config } from '../config'
import { Cache } from '@jpbberry/cache'

import { CensorMethods, GuildDB } from 'typings/api'
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
    super('localhost', Config.db.username, Config.db.password)
  }

  async config (id: Snowflake): Promise<GuildDB> {
    if (this.db == null) return SafeConfig as unknown as GuildDB

    const cached = this.configCache.get(id)
    if (cached != null) return cached

    const db = (await this.collection('guild_data').findOne({ id }) as GuildDB) || Object.assign({ id }, DefaultConfig)

    if (typeof db.censor === 'object') {
      let bit = 0

      // @ts-expect-error Updating database
      if (db.censor.msg) bit |= CensorMethods.Messages
      // @ts-expect-error Updating database
      if (db.censor.nick) bit |= CensorMethods.Nicknames
      // @ts-expect-error Updating database
      if (db.censor.react) bit |= CensorMethods.Reactions

      db.censor = bit
    }

    if (!Array.isArray(db.role)) {
      if (db.role) db.role = []
      else db.role = [db.role]
    }

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
