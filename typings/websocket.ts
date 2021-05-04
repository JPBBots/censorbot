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

interface Variant<Tag extends string, Value> extends Payload {
  e: Tag
  d: Value
}

type Values<T> = T[keyof T]

export type Incoming <Client extends 'frontend' | 'backend'> = Values<{
  [Tag in keyof WebSocketEventMap]: Variant<Tag, WebSocketEventMap[Tag][Client extends 'frontend' ? 'receive' : 'send']>
}>

export interface WebSocketEventMap {
  RETURN: {
    receive: any
    send: null
  }
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
  SET_PREMIUM: {
    receive: {
      guilds: Snowflake[]
    }
    send: true
  }
  ERROR: {
    receive: {
      error: string
    }
    send: null
  }
}