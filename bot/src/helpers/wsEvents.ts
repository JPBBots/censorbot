import { Snowflake } from 'discord-api-types'
import { GuildData, User } from 'typings/api'
import { WebSocketEventMap } from 'typings/websocket'

import { Connection } from '../structures/api/Connection'

export const Events = {
  HEARTBEAT: (con, data, resolve) => {
    resolve?.()
  },
  LOGIN: async (con, data, resolve) => {
    if (!data?.code) return
    const user = await con.socket.manager.oauth.callback(data.code, con.host)
      .catch(err => {
        resolve?.({ error: err.message ?? 'ERROR' })
      })

    if (!user) return

    con.user = user.user
    con.db = await con.socket.manager.extendUser(user.db)

    resolve?.({ ...con.db, _id: undefined, bearer: undefined })
  },
  LOGOUT: (con) => {
    con.user = undefined
    con.db = undefined
  },
  AUTHORIZE: async (con, data, resolve) => {
    if (!con.db) {
      const user = await con.socket.manager.db.collection('users').findOne({ token: data?.token }) as User
      if (!user) throw new Error('Invalid Token')

      con.db = user
    }

    resolve?.({ ...await con.socket.manager.extendUser(con.db), _id: undefined, bearer: undefined })
  },
  GET_GUILDS: async (con, data, resolve) => {
    resolve?.(await con.getGuilds())
  },
  GET_GUILD: async (con, data: Snowflake, resolve) => {
    if (!con.authorized) throw new Error('Not authorized')

    const cached = con.guildCache.get(data)
    if (cached) return resolve?.(cached)

    const short = (await con.getGuilds()).find(x => x.i === data)

    if (!short && !con.db?.admin) throw new Error('No access to guild')

    const guild = await con.socket.manager.thread.getGuild(data)
    if (!guild || !guild.channels || !guild.roles) throw new Error('Not In Guild')

    const g: GuildData = {
      guild: {
        n: guild.name,
        a: guild.icon,
        i: data,
        c: guild.channels?.map(x => ({
          id: x.id,
          name: x.name as string
        })),
        r: guild.roles.map(x => ({
          id: x.id,
          name: x.name
        }))
      },
      premium: await con.socket.manager.db.guildPremium(data),
      db: await con.socket.manager.db.config(data)
    }

    con.guildCache.set(data, g)

    resolve?.(g)
  }
} as {
  [key in keyof WebSocketEventMap]?: (con: Connection, data?: WebSocketEventMap[key]['receive'], resolve?: (data?: WebSocketEventMap[key]['send'] | { error: string }) => void) => void
}
