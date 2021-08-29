import { Config } from '../config'
import { Cache } from '@jpbberry/cache'

import { CensorMethods, ExceptionType, GuildDB } from 'typings/api'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

import { settingSchema, premiumSchema } from '../data/SettingsSchema'

import { Database as Db } from '@jpbbots/interface/dist/Database'
import { Collection } from 'mongodb'

export * from '../data/SettingsSchema'

export class Database extends Db {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  defaultConfig = DefaultConfig
  safeConfig = SafeConfig

  schemas = {
    normal: settingSchema,
    premium: premiumSchema
  }

  constructor () {
    super('localhost', Config.db.username, Config.db.password)
  }

  async config (id: Snowflake): Promise<GuildDB> {
    if (this.db == null) return SafeConfig as unknown as GuildDB

    const cached = this.configCache.get(id)
    if (cached != null) return cached

    let db = (await this.collection('guild_data').findOne({ id }) as GuildDB) || Object.assign({ id }, DefaultConfig)
    db = await this._checkForUpdates(db)

    this.configCache.set(id, db)

    return db
  }

  private async _checkForUpdates (db: GuildDB & Record<any, any> & { censor: any }): Promise<GuildDB> {
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

    if (!db.exceptions) db.exceptions = []

    if (!db.words) db.words = []

    if (db.channels) {
      db.exceptions.push(...db.channels.map(id => ({
        channel: id,
        role: null,
        type: ExceptionType.Everything
      })))

      db.exceptions.push(...db.role.map(id => ({
        channel: null,
        role: id,
        type: ExceptionType.Everything
      })))

      delete db.channels
      delete db.role

      await this.collection('guild_data').updateOne({ id: db.id }, {
        $unset: {
          channels: '',
          role: ''
        },
        $set: db
      })
    }

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
