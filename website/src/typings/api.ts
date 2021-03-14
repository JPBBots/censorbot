export * from '../../../typings/typings'
import { Snowflake } from 'discord-api-types'

import { GuildDB } from '../../../typings/typings'

export interface User {
  /**
   * ID of user
   */
  id: Snowflake
  /**
   * Username#discriminator of user
   */
  tag: string
  /**
   * Avatar hash
   */
  avatar: string
  /**
   * Premium data
   */
  premium: {
    /**
     * Amount of premium servers this user has
     */
    count: number
    /**
     * Guilds that are premium for this users
     */
    guilds: Snowflake[]
  }
  /**
   * Whether or not user is admin
   */
  admin: boolean
}

export interface ShortGuild {
  /**
   * ID of guild
   */
  i: Snowflake
  /**
   * Name of guild
   */
  n: string
  /**
   * CDN Hash of icon
   */
  a: string
}

export interface ExtendedGuild extends ShortGuild {
  /**
   * Array of channels
   */
  c: {id: Snowflake, name: string}[]
  /**
   * Array of roles
   */
  r: {id: Snowflake, name: string}[]
}

export interface GuildData {
  /**
   * Guild data
   */
  guild: ExtendedGuild
  /**
   * Whether or not guild is premium
   */
  premium: boolean
  /**
   * Database data
   */
  db: GuildDB
}

export interface Cluster {
  memory: number
  uptime: number
  id: number
}
export interface Shard {
  events: number
  id: number
  ping: number
  state: 0 | 1 | 2
  connected: boolean
  guilds: number
}

export type AdminResponse = {
  cluster: Cluster
  shards: Shard[]
}[]

export type SmallID = string

export interface Ticket {
  id: SmallID
  word: string
  user: Snowflake
  admin: Snowflake
}

export interface TicketTest {
  censored: boolean,
  places: string[]
}