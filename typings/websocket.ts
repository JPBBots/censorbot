import { User } from "./api";

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
  ERROR: {
    receive: {
      error: string
    }
    send: null
  }
}