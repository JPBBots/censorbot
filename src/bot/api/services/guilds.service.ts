import { EventEmitter } from '@jpbberry/typed-emitter'
import { Injectable } from '@nestjs/common'
import { Snowflake } from 'discord-api-types/v9'
import { GuildData, GuildDB } from '@censorbot/typings'

import patch from '../../utils/Patch'
import pieces from '../../utils/Pieces'
import { CacheService } from './cache.service'
import { DatabaseService } from './database.service'
import { FilterService } from './filter.service'
import { ThreadService } from './thread.service'

@Injectable()
export class GuildsService extends EventEmitter<{
  GUILD_SETTINGS_UPDATE: { id: Snowflake; db: GuildDB }
  GUILD_UPDATED: GuildData
  GUILD_DELETED: Snowflake
}> {
  constructor(
    private readonly thread: ThreadService,
    private readonly database: DatabaseService,
    private readonly caching: CacheService,
    private readonly filter: FilterService
  ) {
    super()

    thread.on('GUILD_UPDATED', async (guildId) => {
      void this.updateGuild(guildId)
    })
    thread.on('GUILD_DELETED', (guildId) => {
      this.caching.guilds.delete(guildId)

      this.caching.userGuilds.forEach((x) => {
        x.forEach((guild) => {
          if (guild.id === guildId) {
            guild.joined = false
          }
        })
      })

      void this.emit('GUILD_DELETED', guildId)
    })
  }

  get db() {
    return this.database.collection('guild_data')
  }

  async updateGuild(id: Snowflake) {
    if (!this.caching.guilds.has(id)) return

    const guild = await this.getGuild(id)
    if (!guild) return

    this.caching.guilds.set(id, guild)
    this.emit('GUILD_UPDATED', guild)
  }

  private async getGuild(guildId: Snowflake): Promise<GuildData> {
    const guild = await this.thread.sendCommand('GUILD_GET', guildId)

    if (!guild || !guild.channels || !guild.roles)
      throw new Error('Not In Guild')

    this.caching.userGuilds
      .filter((x) => x.some((b) => b.id === guild.id))
      .forEach((g) => (g.find((x) => x.id === guild.id)!.joined = true))

    const premiumInfo = await this.database.guildPremium(guild.id)

    return {
      guild,
      premium: premiumInfo.premium,
      trial: premiumInfo.trial,
      db: await this.database.config(guild.id)
    }
  }

  async get(id: Snowflake): Promise<GuildData> {
    const cached = this.caching.guilds.get(id)
    if (cached) return cached

    const guild = await this.getGuild(id)

    this.caching.guilds.set(id, guild)

    return guild
  }

  async set(id: Snowflake, db?: GuildDB): Promise<void | { error: string }> {
    const guild = await this.get(id)

    if (!db) db = guild.db

    if (guild.db.notInDb) {
      guild.db.notInDb = false
      await this.db.updateOne(
        { id },
        {
          $set: guild.db
        },
        { upsert: true }
      )
    }

    const valid = this.database.schema.validate({
      premium: guild.premium,
      ...db
    })
    if (valid.error) return { error: valid.error.message }

    db.id = id

    if (db.filter) {
      if (db.filter.server) {
        db.filter.server = db.filter.server
          .map((x) => this.filter.resolve(x)[0]?.t)
          .filter((x) => x)
      }
    }

    await this.db.updateOne(
      {
        id
      },
      {
        $set: pieces.generate(db)
      }
    )

    guild.db = patch(guild.db, db)

    this.caching.guilds.set(id, guild)

    this.database.dumpGuild(id)

    this.emit('GUILD_SETTINGS_UPDATE', { id, db })
  }
}
