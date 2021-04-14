import { Cache } from '@jpbberry/cache'
import { Snowflake } from 'discord-api-types'
import { Collection } from 'mongodb'
import { GuildData, GuildDB, WebhookReplace } from 'typings'

import patch from '../../utils/Patch'
import pieces from '../../utils/Pieces'

import { Connection } from './Connection'
import { Socket } from './Socket'

export class GuildHandler {
  subs: Map<Snowflake, Set<Connection>> = new Map()
  cache: Cache<Snowflake, GuildData> = new Cache(this.socket.manager.config.dashboardOptions.guildCacheWipeTimeout)

  constructor (private readonly socket: Socket) {}

  get db (): Collection {
    return this.socket.manager.db.collection('guild_data')
  }

  async get (id: Snowflake): Promise<GuildData> {
    const cached = this.cache.get(id)
    if (cached) return cached

    const guild = await this.socket.manager.thread.getGuild(id)
    if (!guild || !guild.channels || !guild.roles) throw new Error('Not In Guild')

    const g: GuildData = {
      guild: {
        n: guild.name,
        a: guild.icon,
        i: id,
        c: guild.channels?.map(x => ({
          id: x.id,
          name: x.name as string
        })),
        r: guild.roles.map(x => ({
          id: x.id,
          name: x.name
        }))
      },
      premium: await this.socket.manager.db.guildPremium(id),
      db: await this.socket.manager.db.config(id)
    }

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

  async set (id: Snowflake, db: GuildDB): Promise<void> {
    const guild = await this.get(id)

    if (guild.db.notInDb) {
      guild.db.notInDb = false
      await this.db.updateOne({ id }, {
        $set: guild.db
      }, { upsert: true })
    }

    const valid = this.socket.manager.db.schema.validate(db, { strip: true })
    if (valid.length > 0) throw valid[0] as unknown as Error

    if (!guild.premium) {
      if (db.filter) db.filter = db.filter.slice(150)
      if (db.uncensor) db.uncensor = db.uncensor.slice(150)

      if (typeof db.msg?.content === 'string') {
        db.msg.content = db.msg.content.slice(0, 200)
      }

      if (typeof db.msg?.deleteAfter === 'number' && db.msg.deleteAfter > 120e3) {
        db.msg.deleteAfter = 120e3
      }

      db.webhook = {
        enabled: false,
        separate: true,
        replace: WebhookReplace.Spoilers
      }

      db.multi = false
      db.fonts = false
      db.dm = false
    }

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
