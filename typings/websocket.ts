import { ExtendedGuild, GuildData, ShortGuild, User } from "./api";

import { Snowflake } from 'discord-api-types'

export interface Payload {
  e: string
  d: any
  i?: number
}

export interface WebSocketEventMap {
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
  GET_GUILD: {
    receive: Snowflake
    send: GuildData
  }
  ERROR: {
    receive: {
      error: string
    }
    send: null
  }
}