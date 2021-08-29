import { Cache } from '@jpbberry/cache'
import { APIGuild, Snowflake } from 'discord-api-types'
import { Collection } from 'mongodb'
import { GuildData, GuildDB } from 'typings'

import patch from '../../utils/Patch'
import pieces from '../../utils/Pieces'

import { Connection } from './Connection'
import { Socket } from './Socket'

export class GuildHandler {
  subs: Map<Snowflake, Set<Connection>> = new Map()
  cache: Cache<Snowflake, GuildData> = new Cache(this.socket.manager.config.dashboardOptions.wipeTimeout)

  constructor (private readonly socket: Socket) {
    socket.manager.thread.on('HAS_SUB', (id, resolve) => {
      resolve((this.subs.get(id)?.size ?? 0) > 0)
    })
    socket.manager.thread.on('GUILD_UPDATED', async (guild) => {
      const subs = this.subs.get(guild.id)
      if (!subs || subs.size < 1) return

      const updated = await this._formatGuild(guild).catch(() => null)
      if (!updated) return

      this.cache.set(guild.id, updated)

      subs.forEach(sub => {
        sub.sendEvent('UPDATE_GUILD', updated)
      })
    })
  }

  get db (): Collection {
    return this.socket.manager.db.collection('guild_data')
  }

  private async _formatGuild (guild?: APIGuild): Promise<GuildData> {
    if (!guild || !guild.channels || !guild.roles) throw new Error('Not In Guild')

    return {
      guild: {
        n: guild.name,
        a: guild.icon,
        i: guild.id,
        c: guild.channels.map(x => ({
          id: x.id,
          name: x.name ?? '',
          type: x.type,
          parent_id: x.parent_id
        })),
        r: guild.roles.filter(x => !x.managed && x.id !== guild.id).map(x => ({
          id: x.id,
          name: x.name,
          color: x.color
        }))
      },
      premium: await this.socket.manager.db.guildPremium(guild.id),
      db: await this.socket.manager.db.config(guild.id)
    }
  }

  async get (id: Snowflake): Promise<GuildData> {
    const cached = this.cache.get(id)
    if (cached) return cached

    const guild = await this.socket.manager.thread.getGuild(id)

    const g = await this._formatGuild(guild)

    this.cache.set(id, g)

    return g
  }

  async subscribe (con: Connection, id: Snowflake): Promise<GuildData> {
    let sub = this.subs.get(id)
    if (!sub) {
      sub = new Set()
    }

    sub.add(con)
    this.subs.set(id, sub)

    return await this.get(id)
  }

  unsubscribe (con: Connection, id: Snowflake): void {
    this.subs.get(id)?.delete(con)
  }

  async set (id: Snowflake, db?: GuildDB): Promise<void> {
    const guild = await this.get(id)

    if (!db) db = guild.db

    if (guild.db.notInDb) {
      guild.db.notInDb = false
      await this.db.updateOne({ id }, {
        $set: guild.db
      }, { upsert: true })
    }

    const valid = this.socket.manager.db.schemas[guild.premium ? 'premium' : 'normal'].validate(db)
    if (valid.error) throw valid.error

    db.id = id

    db.filter = (db.filter || guild.db.filter).map(x => this.socket.manager.filter.resolve(x)[0]?.t).filter(x => x)

    await this.socket.manager.db.collection('guild_data').updateOne({
      id
    }, {
      $set: pieces.generate(db)
    })

    guild.db = patch(guild.db, db)

    this.cache.set(id, guild)

    this.socket.manager.db.configCache.delete(id)
    this.socket.manager.thread.tell('GUILD_DUMP', id)

    this._dispatchChange(id, db)
  }

  private _dispatchChange (id: Snowflake, data: any): void {
    const subs = this.subs.get(id)
    if (!subs) return

    subs.forEach(con => {
      con.sendEvent('CHANGE_SETTING', { id, data })
    })
  }
}
