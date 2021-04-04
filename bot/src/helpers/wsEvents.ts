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

    con.user = user.user
    con.db = user.db

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

    resolve?.({ ...con.db, _id: undefined, bearer: undefined })
  }
} as {
  [key in keyof WebSocketEventMap]?: (con: Connection, data?: WebSocketEventMap[key]['receive'], resolve?: (data?: WebSocketEventMap[key]['send'] | { error: string }) => void) => void
}
