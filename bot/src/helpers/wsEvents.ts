import { User } from 'typings/api'
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

    con.db = await con.socket.manager.extendUser(user.db)

    resolve?.({ ...con.db, _id: undefined, bearer: undefined })
  },
  LOGOUT: (con) => {
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
  }
} as {
  [key in keyof WebSocketEventMap]?: (con: Connection, data?: WebSocketEventMap[key]['receive'], resolve?: (data?: WebSocketEventMap[key]['send'] | { error: string }) => void) => void
}
