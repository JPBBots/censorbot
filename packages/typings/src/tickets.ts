import { Snowflake } from 'jadl'
import { ShortID } from './api'

export interface TicketBanSchema {
  id: Snowflake
  reason: string
  when: Date
  admin: Snowflake
  banned: boolean
}

export interface Ticket {
  id: ShortID
  word: string
  user: Snowflake
  admin?: Snowflake
  msg?: Snowflake
  accepted: boolean
}

export interface TicketTest {
  censored: boolean
  places: string[]
}
