import { Config } from '../config'
import { Cache } from '@jpbberry/cache'

import { CensorMethods, GuildDB } from 'typings/api'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

import { schema } from '../data/ConfigSchema'

import { Database as Db } from 'interface/dist/Database'
import { Collection } from 'mongodb'

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

    let db = (await this.collection('guild_data').findOne({ id }) as GuildDB) || Object.assign({ id }, DefaultConfig)
    db = await this._checkForUpdates(db)

    if (!Array.isArray(db.role)) {
      if (db.role) db.role = []
      else db.role = [db.role]
    }

    this.configCache.set(id, db)

    return db
  }

  private async _checkForUpdates (db: any): Promise<GuildDB> {
    if (typeof db.censor === 'object') {
      let bit = 0

      if (db.censor.msg) bit |= CensorMethods.Messages
      if (db.censor.nick) bit |= CensorMethods.Names
      if (db.censor.react) bit |= CensorMethods.Reactions

      db.censor = bit
    }

    if (db.matchExact) {
      if (!db.phrases) db.phrases = [...db.filter]
      db.filter = []

      delete db.matchExact

      await this.db?.collection('guild_data').updateOne({ id: db.id }, {
        $unset: {
          matchExact: ''
        },
        $set: db
      })
    }

    if (!db.phrases) db.phrases = []

    if (!db.punishment.ignored) db.punishment.ignored = []
    if (!db.webhook.ignored) db.webhook.ignored = []

    return db
  }

  get premium (): Collection<{
    id: Snowflake
    guilds: Snowflake[]
  }> {
    return this.collection('premium_users')
  }

  async guildPremium (id: Snowflake): Promise<boolean> {
    const response = await this.premium.find({
      guilds: {
        $elemMatch: { $eq: id }
      }
    }).toArray()
      .then(x => x.length)

    return response > 0
  }
}
