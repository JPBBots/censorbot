import { Embed } from 'discord-rose'
import { filters, User } from 'typings/api'
import { WebSocketEventMap } from 'typings/websocket'

import { Connection } from '../structures/api/Connection'
import { FilterResponse } from '../structures/Filter'
import Pieces from '../utils/Pieces'

function test (str: string): FilterResponse {
  delete require.cache[require.resolve('../structures/Filter')]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Filter } = require('../structures/Filter')
  const filt = new Filter()

  return filt.test(str, {
    matchExact: false,
    filter: [],
    uncensor: [],
    filters
  })
}

export const Events = {
  HEARTBEAT: (con, data, resolve) => {
    resolve?.()
  },
  LOGOUT: (con) => {
    con.userId = undefined
  },
  AUTHORIZE: async (con, data, resolve) => {
    let newUser: User
    if (!con.db) {
      const user = await con.socket.manager.db.collection('users').findOne({ token: data?.token }) as User
      if (!user) throw new Error('Invalid Token')

      con.userId = user.id
      newUser = user
    } else {
      newUser = con.db
    }
    if (!newUser) return

    if (data?.customer) con.socket.manager.chargebee.cache.delete(newUser.id)

    const user = await con.socket.manager.extendUser(newUser)
    con.socket.cachedUsers.set(newUser.id, user)

    resolve?.({ ...user, _id: undefined, bearer: undefined })
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

    await con.socket.guilds.set(data.id, Pieces.normalize(data.data))

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
  },
  GET_TICKETS: async (con, data, resolve) => {
    if (!con.db?.admin) return resolve?.({ error: 'Not Admin' })

    resolve?.(await con.socket.manager.db.collection('tickets').find({ accepted: true }).toArray())
  },
  TEST_TICKET: async (con, data, resolve) => {
    if (!con.db?.admin) return resolve?.({ error: 'Not Admin' })

    const ticket = await con.socket.manager.db.collection('tickets').findOne({ id: data?.id })

    if (!ticket) return resolve?.({ error: 'Invalid Ticket' })

    const res = test(ticket.word)

    resolve?.({
      censored: res.censor,
      places: res.places.map(x => x.toJSON())
    })
  },
  ACCEPT_TICKET: async (con, data, resolve) => {
    if (!con.db?.admin) return resolve?.({ error: 'Not Admin' })

    const ticket = await con.socket.manager.db.collection('tickets').findOne({ id: data?.id })

    if (!ticket) return resolve?.({ error: 'Invalid Ticket' })

    const res = test(ticket.word)

    if (res.censor) return resolve?.({ error: 'Ticket still censored' })

    void con.socket.manager.rest.users.dm(ticket.user, new Embed()
      .title('Ticket finished')
      .description(ticket.id)
    )

    await con.socket.manager.db.collection('tickets').deleteOne({ id: ticket.id })

    resolve?.({
      success: true
    })

    con.socket.manager.thread.tell('RELOAD', 'FILTER')
  },
  DENY_TICKET: async (con, data, resolve) => {
    if (!con.db?.admin) return resolve?.({ error: 'Not Admin' })

    const ticket = await con.socket.manager.db.collection('tickets').findOne({ id: data?.id })

    if (!ticket) return resolve?.({ error: 'Invalid Ticket' })

    void con.socket.manager.rest.users.dm(ticket.user, new Embed()
      .title('After further review, your ticket was denied.')
      .description(ticket.id)
      .footer('Reminder that you can always add words to your uncensor list to stop it in your server specifically.')
    )

    await con.socket.manager.db.collection('tickets').deleteOne({ id: ticket.id })

    resolve?.({
      success: true
    })
  }
} as {
  [key in keyof WebSocketEventMap]?: (con: Connection, data?: WebSocketEventMap[key]['receive'], resolve?: (data?: WebSocketEventMap[key]['send'] | { error: string }) => void) => void
}
