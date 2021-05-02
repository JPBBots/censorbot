import { GuildData, ShortGuild, User } from "./api";

import { Snowflake } from 'discord-api-types'

export interface Payload {
  e: string
  d: any
  i?: number
}

export type Region = 'na' | 'eu'

export interface MetaObject {
  worker: number
  connection: string
  region: Region
}

export interface WebSocketEventMap {
  HELLO: {
    receive: {
      interval: number
      $meta: MetaObject
    }
    send: null
  }
  HEARTBEAT: {
    receive: null
    send: null
  }
  LOGIN: {
    receive: {
      code: string
    }
    send: User
  }
  LOGOUT: {
    receive: null
    send: null
  }
  AUTHORIZE: {
    receive: {
      token: string
    }
    send: User
  }
  GET_GUILDS: {
    receive: null
    send: ShortGuild[]
  }
  SUBSCRIBE: {
    receive: Snowflake
    send: GuildData
  }
  UNSUBSCRIBE: {
    receive: Snowflake
    send: null
  }
  CHANGE_SETTING: {
    receive: {
      id: Snowflake,
      data: any
    },
    send: true
  }
  RELOAD: {
    receive: null
    send: null
  }
  ERROR: {
    receive: {
      error: string
    }
    send: null
  }
}