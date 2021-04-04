import { Snowflake } from 'discord-api-types'

export type filterType = 'en' | 'es' | 'off' | 'de' | 'ru'

export enum PunishmentType {
  Nothing = 0,
  Mute,
  Kick,
  Ban
}

export enum WebhookReplace {
  Spoilers = 0,
  Hashtags,
  Stars
}

export interface GuildDB {
  /**
   * ID of guild
   */
  id?: Snowflake
  /**
   * Filters being used
   */
  filters: filterType[]
  /**
   * Censor options
   */
  censor: {
    /**
     * Whether to censor messages
     */
    msg: boolean
    /**
     * Whether to censor edited messages
     */
    emsg: boolean
    /**
     * Whether to censor nicknames
     */
    nick: boolean
    /**
     * Whether to censor reaction emoji names
     */
    react: boolean
  }
  /**
   * Log channel ID
   */
  log: Snowflake|null
  /**
   * Ignored role ID
   */
  role: Snowflake|null
  /**
   * List of words to filter
   */
  filter: string[]
  /**
   * List of words to uncensor
   */
  uncensor: string[]
  /**
   * Popup message options
   */
  msg: {
    /**
     * Message to send
     */
    content: string|false|null
    /**
     * Delete after x ms
     */
    deleteAfter?: number
  }
  /**
   * Punishment settings
   */
  punishment: {
    /**
     * Type of punishment
     */
    type: PunishmentType
    amount: number
    role: Snowflake|null
    time: number|null
    expires: number|null
  }
  webhook: {
    enabled: boolean
    separate: boolean
    replace: WebhookReplace
  }
  multi: boolean
  prefix: string|null
  channels: Snowflake[]
  nsfw: boolean
  invites: boolean
  fonts: boolean
  dm: boolean
}

export interface User {
  /**
   * Censor Bot API Token
   */
  token: string
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
  avatar: string | null
  /**
   * Premium data
   */
  premium?: {
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
  admin?: boolean

  _id?: string
  bearer?: string
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