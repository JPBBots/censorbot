import { MongoClient, Db } from 'mongodb'

import { Config } from '../config'
import { Cache } from 'discord-rose/dist/utils/Cache'

import { GuildDB } from '../../../typings/typings'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

export class Database {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  mongo: MongoClient
  db?: Db

  constructor () {
    this.mongo = new MongoClient(`mongodb://${Config.db.username}:${Config.db.password}@${Config.db.host}:27017/`, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  }

  async connect () {
    await this.mongo.connect()

    this.db = this.mongo.db('censorbot')
  }

  async config (id: Snowflake): Promise<GuildDB> {
    if (this.db == null) return SafeConfig as GuildDB

    const cached = this.configCache.get(id)
    if (cached != null) return cached

    const db = (await this.db.collection('guild_data').findOne({ id }) as GuildDB) || Object.assign({ id }, DefaultConfig) as GuildDB

    this.configCache.set(id, db)

    return db
  }
}
