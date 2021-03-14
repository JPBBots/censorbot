import { MongoClient, Db } from 'mongodb'

import { Config } from '../config'
import { Cache } from 'discord-rose/dist/utils/Cache'

import { GuildDB } from '../../../typings/typings'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

export class Database {
  configCache = new Cache(5 * 60 * 1000) as Cache<Snowflake, GuildDB>

  mongo: MongoClient
  db: Db

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
    if (!this.db) return SafeConfig as GuildDB

    const cached = this.configCache.get(id)
    if (cached) return cached

    const db: GuildDB = await this.db.collection('guild_data').findOne({ id }) || Object.assign({ id }, DefaultConfig)

    this.configCache.set(id, db)

    return db
  }
}