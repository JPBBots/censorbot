import { User } from 'typings/api'
import { WebSocketEventMap } from 'typings/websocket'

import { Connection } from '../structures/api/Connection'

export const Events = {
  HEARTBEAT: (con, data, resolve) => {
    resolve?.()
  },
  LOGOUT: (con) => {
    con.userId = undefined
  },
  AUTHORIZE: async (con, data, resolve) => {
    if (!con.db) {
      const user = await con.socket.manager.db.collection('users').findOne({ token: data?.token }) as User
      if (!user) throw new Error('Invalid Token')

      con.userId = user.id
      con.socket.cachedUsers.set(user.id, user)
    }
    if (!con.db) return

    resolve?.({ ...await con.socket.manager.extendUser(con.db), _id: undefined, bearer: undefined })
  },
  GET_GUILDS: async (con, data, resolve) => {
    resolve?.(await con.getGuilds())
  },
  SUBSCRIBE: async (con, data, resolve) => {
    if (!data) return resolve?.({ error: 'Invalid Payload' })

    if (!await con.access(data)) return resolve?.({ error: 'Unauthorized' })

    if (con.subscribed) {
      con.socket.guilds.unsubscribe(con, con.subscribed)
      con.subscribed = undefined
    }

    const guild = await con.socket.guilds.subscribe(con, data)
    con.subscribed = data

    resolve?.(guild)
  },
  UNSUBSCRIBE: async (con) => {
    if (!con.subscribed) return

    con.socket.guilds.unsubscribe(con, con.subscribed)
  },
  CHANGE_SETTING: async (con, data, resolve) => {
    if (!con.authorized || !data || !data.data || !data.id) return resolve?.({ error: 'Invalid Payload' })

    if (!await con.access(data.id)) return resolve?.({ error: 'You cannot do this' })

    await con.socket.guilds.set(data.id, data.data)

    resolve?.(true)
  },
  SET_PREMIUM: async (con, data, resolve) => {
    if (!con.authorized || !con.db?.premium || !data || !data.guilds) return

    if (data.guilds.length > con.db.premium.count) {
      return resolve?.({
        error: 'Not enough premium servers.'
      })
    }

    if (!data.guilds.every(x => x.match(/^[0-9]{5,}$/))) return resolve?.({ error: 'Strange guild ID' })

    await con.socket.manager.db.collection('premium_users').updateOne({ id: con.db.id }, {
      $set: {
        id: con.db.id,
        guilds: data.guilds
      }
    }, {
      upsert: true
    })

    con.db.premium.guilds.filter(x => !data.guilds.includes(x)).forEach(guild => {
      const cur = con.socket.guilds.cache.get(guild)
      if (!cur) return

      cur.premium = false
      con.socket.guilds.cache.set(guild, cur)
    })
    data.guilds.forEach(guild => {
      const cur = con.socket.guilds.cache.get(guild)
      if (!cur) return

      cur.premium = true
      con.socket.guilds.cache.set(guild, cur)
    })

    con.db.premium.guilds = data.guilds
    resolve?.(true)
  }
} as {
  [key in keyof WebSocketEventMap]?: (con: Connection, data?: WebSocketEventMap[key]['receive'], resolve?: (data?: WebSocketEventMap[key]['send'] | { error: string }) => void) => void
}
