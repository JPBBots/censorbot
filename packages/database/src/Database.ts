import Config from '@censorbot/config'
import { Cache } from '@jpbberry/cache'

import {
  CensorMethods,
  GuildDB,
  Ticket,
  User,
  WebhookReplace,
  CustomBotOptions,
  FilterType,
  Plugin,
  PunishmentLevel,
  CustomerSchema,
  PremiumUserSchema,
  FilterDatabaseEntry,
  PunishmentSchema,
  TimeoutSchema,
  TicketBanSchema,
  SensitiveUser
} from '@censorbot/typings'

import { Filter } from '@censorbot/filter'

import { Snowflake } from 'discord-api-types/v9'

import DefaultConfig from './configs/DefaultConfig.json'
import SafeConfig from './configs/SafeConfig.json'

import { settingSchema } from './schemas/settings.schema'

import { Database as Db } from '@jpbbots/interface/dist/Database'
import { ThreadComms } from 'jadl/dist/clustering/ThreadComms'
import { enumCombiner } from '@censorbot/utils'
import { Document, WithoutId } from 'mongodb'

export interface DatabaseCollections {
  customers: CustomerSchema
  guild_data: GuildDB
  premium_users: PremiumUserSchema
  trials: {
    guild: Snowflake
    until: number
    disabled: boolean
    user: Snowflake | null
  }
  punish: PunishmentSchema
  tickets: Ticket
  ticketban: TicketBanSchema
  timeouts: TimeoutSchema
  custombots: CustomBotOptions
  users: SensitiveUser
  filter_data: FilterDatabaseEntry
}

export class Database extends Db {
  configCache: Cache<Snowflake, GuildDB> = new Cache(5 * 60 * 1000)

  defaultConfig = DefaultConfig as GuildDB
  safeConfig = SafeConfig as GuildDB

  schema = settingSchema

  get collection() {
    return <
      C extends keyof DatabaseCollections,
      S extends Document = DatabaseCollections[C]
    >(
      name: C
    ) => super.collection<S>(name)
  }

  constructor(private readonly comms?: ThreadComms, public filter?: Filter) {
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
        JSON.parse(JSON.stringify(DefaultConfig))
      ) as DatabaseCollections['guild_data'])

    // temp migration
    if (!db.v || db.v < 10) db = await this._checkForUpdates(db as any)

    if (db.v !== this.currentVersion) db = await this.updater(db as any)

    this.configCache.set(id, db)

    return db
  }

  currentVersion = 16

  private async updater(
    db: WithoutId<GuildDB> & {
      filter: any
      filters: any
      phrases: any
      words: any
      fonts: any
      uncensor: any
      toxicity: boolean
      images: boolean
      ocr: boolean
      antiHoist: boolean
      phishing: boolean
      invites: boolean
      nsfw: boolean
      multi: boolean
      channels: Snowflake[]
      roles: Snowflake[]
      msg
      webhook
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
      case 11:
        {
          db.plugins = 0
          if (db.toxicity) db.plugins |= Plugin.Toxicity
          if (db.images) db.plugins |= Plugin.AntiNSFWImages
          if (db.ocr) db.plugins |= Plugin.OCR
          if (db.antiHoist) db.plugins |= Plugin.AntiHoist
          if (db.phishing) db.plugins |= Plugin.Phishing
          if (db.invites) db.plugins |= Plugin.Invites
          if (db.multi) db.plugins |= Plugin.MultiLine

          removeProps.push(
            'toxicity',
            'images',
            'ocr',
            'antiHoist',
            'phishing',
            'invites',
            'multi'
          )

          db.response = db.msg
          db.resend = db.webhook
          removeProps.push('webhook', 'msg')

          const advancedExceptions = db.exceptions as unknown as any[]

          db.exceptions = {
            nsfw: db.nsfw,
            channels: db.channels,
            roles: db.roles,
            advanced: advancedExceptions
          }
          removeProps.push('nsfw', 'channels', 'roles')

          if (db.censor) {
            db.plugins |= Plugin.Attachments
          }

          db.v = 12
        }
        break
      case 12:
        {
          if (typeof db.exceptions.roles === 'string')
            db.exceptions.roles = [db.exceptions.roles]
          db.v = 13
        }
        break
      case 13:
        {
          db.punishments.levels.forEach((level: any, i) => {
            if ('expires' in level) {
              if (!db.punishments.expires) {
                db.punishments.expires = level.expires
              }

              delete level['expires']

              db.punishments.levels[i] = level
            }
          })

          db.v = 14
        }
        break
      case 14:
        {
          db.filter.server = [
            ...new Set(
              db.filter.server
                .map((x) => this.filter!.resolve(x)[0]?.t)
                .filter((x) => x)
            )
          ]

          db.punishments.levels.forEach((level: any, i) => {
            type UnionKeys<T> = T extends T ? keyof T : never
            const lvl: { [key in UnionKeys<PunishmentLevel>]: any } = {
              amount: level.amount,
              role: level.role,
              time: level.time,
              type: level.type
            }

            db.punishments.levels[i] = lvl as PunishmentLevel
          })

          db.v = 15
        }
        break
      case 15:
        {
          db.filter.uncensor = [
            ...new Set(
              db.filter.uncensor
                .map((x) => this.filter!.resolve(x)[0]?.t)
                .filter((x) => x)
            )
          ]

          db.v = 16
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
      exceptions: any
      phishing?: any
      uncensor: any
      channels: any
      roles: any
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

      if (!Array.isArray(db.roles)) db.roles[db.roles]

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

  async guildPremium(guildId: Snowflake): Promise<{
    premium: boolean
    premiumUser?: Snowflake
    trial: number | null
  }> {
    const response = await this.collection('premium_users')
      .find({
        guilds: {
          $elemMatch: { $eq: guildId }
        }
      })
      .toArray()

    if (response.length > 0)
      return { premium: true, premiumUser: response[0].id, trial: null }

    const trial = await this.collection('trials').findOne({
      guild: guildId
    })

    return {
      premium: trial ? trial.until > Date.now() && !trial.disabled : false,
      premiumUser: trial ? trial.user || undefined : undefined,
      trial: trial ? trial.until : null
    }
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

          exceptions: {
            ...db.exceptions,
            channels: db.exceptions.channels.slice(0, 5),
            roles: db.exceptions.roles.slice(0, 5),
            advanced: db.exceptions.advanced.slice(0, 5)
          },

          resend: {
            enabled: false,
            separate: true,
            replace: WebhookReplace.Spoilers
          },

          punishments: {
            ...db.punishments,
            levels: db.punishments.levels.slice(0, 5)
          },

          response: {
            content: db.response.content
              ? db.response.content.slice(0, 200)
              : db.response.content,
            deleteAfter:
              db.response.deleteAfter || 0 > 120e3
                ? 120e3
                : db.response.deleteAfter,
            dm: false
          },

          plugins:
            db.plugins &
            ~Plugin.AntiNSFWImages &
            ~Plugin.MultiLine &
            ~Plugin.OCR &
            ~Plugin.Toxicity
        }
      }
    )

    this.dumpGuild(id)
  }
}
