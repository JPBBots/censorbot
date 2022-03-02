import { Config } from '../config'
import { Cache } from '@jpbberry/cache'

import {
  CensorMethods,
  GuildDB,
  Ticket,
  User,
  WebhookReplace,
  CustomBotOptions,
  FilterType
} from '@jpbbots/cb-typings'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

import { settingSchema } from '../data/SettingsSchema'

import { Database as Db } from '@jpbbots/interface/dist/Database'
import { CustomerSchema } from '../types'
import { PunishmentSchema } from './punishments/PunishmentManager'
import { TimeoutSchema } from './punishments/Timeouts'
import { TicketBanSchema } from './TicketManager'
import { ThreadComms } from 'jadl/dist/clustering/ThreadComms'
import { enumCombiner } from '../utils/enumCombiner'
import { FilterDatabaseEntry } from './Filter'

export * from '../data/SettingsSchema'

export interface DatabaseCollections {
  customers: CustomerSchema
  guild_data: GuildDB
  premium_users: {
    id: Snowflake
    guilds: Snowflake[]
  }
  punish: PunishmentSchema
  tickets: Ticket
  ticketban: TicketBanSchema
  timeouts: TimeoutSchema
  custombots: CustomBotOptions
  users: User
  filter_data: FilterDatabaseEntry
}

export class Database extends Db {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  defaultConfig = DefaultConfig
  safeConfig = SafeConfig

  schema = settingSchema

  // @ts-expect-error
  get collection() {
    return <C extends keyof DatabaseCollections>(name: C) =>
      super.collection<DatabaseCollections[C]>(name)
  }

  constructor(private readonly comms?: ThreadComms) {
    super(
      process.env.DB_URL ?? 'mongodb',
      Config.db.username,
      Config.db.password,
      true
    )

    this.comms?.on('GUILD_DUMP', (id) => {
      this.configCache.delete(id)
    })
  }

  async config(id: Snowflake): Promise<GuildDB> {
    if (this.db == null) return SafeConfig as unknown as GuildDB

    const cached = this.configCache.get(id)
    if (cached != null) return cached

    let db =
      (await this.collection('guild_data').findOne({ id })) ??
      (Object.assign(
        { id },
        DefaultConfig
      ) as DatabaseCollections['guild_data'])

    // temp migration
    if (!db.v || db.v < 10) db = await this._checkForUpdates(db as any)

    if (db.v !== this.currentVersion) db = await this.updater(db as any)

    this.configCache.set(id, db)

    return db
  }

  currentVersion = 11

  private async updater(
    db: GuildDB & {
      filter: any
      filters: any
      phrases: any
      words: any
      font: any
      uncensor: any
    }
  ): Promise<GuildDB> {
    let needsUpdate = true
    const removeProps: Array<keyof typeof db> = ['fonts']

    switch (db.v) {
      case 10:
        {
          const currentFilter = db.filter
          db.filter = {
            base: db.filters,
            server: currentFilter,
            phrases: db.phrases,
            words: db.words,
            uncensor: db.words
          }

          removeProps.push('filters', 'phrases', 'words', 'uncensor')
          db.v = 11
        }
        break
      default:
        needsUpdate = false
    }

    if (db.v !== this.currentVersion) db = (await this.updater(db)) as any

    if (needsUpdate) {
      removeProps.forEach((d) => delete db[d])

      db.v = this.currentVersion

      await this.collection('guild_data').updateOne(
        { id: db.id },
        {
          $set: db,
          $unset: removeProps.reduce((a, b) => {
            a[b] = ''

            return a
          }, {})
        }
      )
    }

    return db
  }

  private async _checkForUpdates(
    db: Partial<GuildDB> & {
      censor: any
      punishment: any
      matchExact: any
      role: any
      filter: any
      filters: any
      phrases: any
      words: any
      uncensor: any
    } & {
      v?: number
    }
  ): Promise<GuildDB> {
    const removeProps: Array<keyof typeof db> = []

    if (typeof db.censor === 'object') {
      let bit = 0

      if (db.censor.msg) bit |= CensorMethods.Messages
      if (db.censor.nick) bit |= CensorMethods.Names
      if (db.censor.react) bit |= CensorMethods.Reactions

      db.censor = bit
    }

    if ('matchExact' in db) {
      if (db.matchExact) {
        if (!db.phrases) db.phrases = [...db.filter!]
        db.filter = []
      }

      removeProps.push('matchExact')
    }

    if (!db.phrases) db.phrases = []

    if (!db.exceptions) db.exceptions = []

    if (!db.words) db.words = []

    if (!db.nickReplace) db.nickReplace = 'Inappropriate Nickname'

    if (!('removeNick' in db)) db.removeNick = true

    if (!('phishing' in db)) db.phishing = !!db.censor

    if (!('punishments' in db)) {
      db.punishments = {
        levels: db.punishment.type ? [db.punishment] : [],
        expires: null,
        allow: enumCombiner(FilterType),
        log: null
      }

      removeProps.push('punishment')
    }

    if (!db.channels) db.channels = []
    if (!db.roles) db.roles = []

    if (db.role) {
      db.roles = db.role

      removeProps.push('role')
    }

    db.v = 10

    removeProps.forEach((d) => delete db[d])

    await this.collection('guild_data').updateOne(
      { id: db.id },
      {
        $set: db,
        $unset: removeProps.reduce((a, b) => {
          a[b] = ''

          return a
        }, {})
      }
    )

    return await this.updater(db as any)
  }

  async guildPremium(id: Snowflake): Promise<boolean> {
    const response = await this.collection('premium_users')
      .find({
        guilds: {
          $elemMatch: { $eq: id }
        }
      })
      .toArray()
      .then((x) => x.length)

    return response > 0
  }

  dumpGuild(id: Snowflake) {
    this.configCache.delete(id)

    this.comms?.tell('GUILD_DUMP', id)
  }

  async removeGuildPremium(id: Snowflake) {
    const db = await this.config(id)

    await this.collection('guild_data').updateOne(
      { id: db.id },
      {
        $set: {
          dm: false,
          filter: {
            ...db.filter,
            server: db.filter.server.slice(0, 150),
            uncensor: db.filter.uncensor.slice(0, 150),
            phrases: db.filter.uncensor.slice(0, 150),
            words: db.filter.words.slice(0, 150)
          },

          censor: db.censor & ~CensorMethods.Avatars,

          channels: db.channels.slice(0, 5),
          roles: db.roles.slice(0, 5),
          exceptions: db.exceptions.slice(0, 5),

          webhook: {
            enabled: false,
            separate: true,
            replace: WebhookReplace.Spoilers
          },

          punishments: {
            ...db.punishments,
            levels: db.punishments.levels.slice(0, 5)
          },

          msg: {
            content: db.msg.content
              ? db.msg.content.slice(0, 200)
              : db.msg.content,
            deleteAfter:
              db.msg.deleteAfter > 120e3 ? 120e3 : db.msg.deleteAfter,
            dm: false
          },

          multi: false,
          toxicity: false,
          images: false,
          ocr: false
        }
      }
    )

    this.dumpGuild(id)
  }
}
