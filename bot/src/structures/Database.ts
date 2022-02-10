import { Config } from '../config'
import { Cache } from '@jpbberry/cache'

import {
  CensorMethods,
  ExceptionType,
  GuildDB,
  Ticket,
  User,
  WebhookReplace,
  CustomBotOptions,
  allFilterTypes
} from '@jpbbots/cb-typings'
import { Snowflake } from 'discord-api-types'

import DefaultConfig from '../data/DefaultConfig.json'
import SafeConfig from '../data/SafeConfig.json'

import { settingSchema, premiumSchema } from '../data/SettingsSchema'

import { Database as Db } from '@jpbbots/interface/dist/Database'
import { CustomerSchema } from '../types'
import { PunishmentSchema } from './punishments/PunishmentManager'
import { TimeoutSchema } from './punishments/Timeouts'
import { TicketBanSchema } from './TicketManager'
import { ThreadComms } from 'jadl/dist/clustering/ThreadComms'

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
}

export class Database extends Db {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  defaultConfig = DefaultConfig
  safeConfig = SafeConfig

  schemas = {
    normal: settingSchema,
    premium: premiumSchema
  }

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
      ((await this.collection('guild_data').findOne({ id })) as GuildDB) ||
      Object.assign({ id }, DefaultConfig)
    db = await this._checkForUpdates(db as any)

    this.configCache.set(id, db)

    return db
  }

  private async _checkForUpdates(
    db: Partial<GuildDB> & Record<any, any> & { censor: any; punishment: any }
  ): Promise<GuildDB> {
    if (typeof db.censor === 'object') {
      let bit = 0

      if (db.censor.msg) bit |= CensorMethods.Messages
      if (db.censor.nick) bit |= CensorMethods.Names
      if (db.censor.react) bit |= CensorMethods.Reactions

      db.censor = bit
    }

    if (db.matchExact) {
      if (!db.phrases) db.phrases = [...db.filter!]
      db.filter = []

      delete db.matchExact

      await this.db?.collection('guild_data').updateOne(
        { id: db.id },
        {
          $unset: {
            matchExact: ''
          },
          $set: db
        }
      )
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
        allow: allFilterTypes
      }
      delete db.punishment

      await this.collection('guild_data').updateOne(
        {
          id: db.id
        },
        {
          $unset: {
            punishment: ''
          },
          $set: db
        }
      )
    }

    if (db.channels) {
      db.exceptions.push(
        ...db.channels.map((id) => ({
          channel: id,
          role: null,
          type: ExceptionType.Everything
        }))
      )

      db.exceptions.push(
        ...db.role.map((id) => ({
          channel: null,
          role: id,
          type: ExceptionType.Everything
        }))
      )

      delete db.channels
      delete db.role

      await this.collection('guild_data').updateOne(
        { id: db.id },
        {
          $unset: {
            channels: '',
            role: ''
          },
          $set: db
        }
      )
    }

    return db as GuildDB
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
          filter: db.filter.slice(0, 150),
          uncensor: db.uncensor.slice(0, 150),
          phrases: db.phrases.slice(0, 150),
          words: db.words.slice(0, 150),

          exceptions: db.exceptions.slice(0, 15),

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
