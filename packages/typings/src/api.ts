import { Snowflake } from 'discord-api-types/v9'
import { baseFilters } from './filter'
import { PunishmentLevel } from './punishments'

export interface ServerSideProps {
  serverCount: number
  trialLength: number
}

export enum PremiumTypes {
  Premium = 'premium',
  YearlyPremium = 'premium-yearly',
  SuperPremium = 'super-premium',
  OwnInstance = 'own-instance'
}

export enum WebhookReplace {
  Spoilers = 0,
  Hashtags,
  Stars
}

export enum CensorMethods {
  Messages = 1 << 0,
  Names = 1 << 1,
  Reactions = 1 << 2,
  Threads = 1 << 3,
  Avatars = 1 << 4
}

export enum ExceptionType {
  Everything,
  ServerFilter,
  PreBuiltFilter,
  Punishment,
  Resend,
  Response,
  Invites,
  AntiHoist
}

export enum Plugin {
  AntiHoist = 1 << 0,
  Invites = 1 << 1,
  Phishing = 1 << 2,
  Toxicity = 1 << 3,
  OCR = 1 << 4,
  AntiNSFWImages = 1 << 5,
  MultiLine = 1 << 6,
  Attachments = 1 << 7
}

export interface AdvancedException {
  role: Snowflake | null
  channel: Snowflake | null
  type: ExceptionType
}

export interface FilterSettings {
  base: baseFilters[]
  server: string[]
  phrases: string[]
  words: string[]
  uncensor: string[]
}

export interface GuildDB {
  /**
   * ID of guild
   */
  id?: Snowflake
  /**
   * Censor options
   */
  censor: number
  nickReplace: string
  removeNick: boolean

  plugins: number

  exceptions: {
    nsfw: boolean
    channels: Snowflake[]
    roles: Snowflake[]
    advanced: AdvancedException[]
  }
  /**
   * Log channel ID
   */
  log: Snowflake | null
  /**
   * Filter settings
   */
  filter: FilterSettings
  /**
   * Popup message options
   */
  response: {
    /**
     * Message to send
     */
    content: string | false | null
    /**
     * Delete after x ms
     */
    deleteAfter: number | false
    /**
     * Whether or not to DM popup messages
     */
    dm: boolean
  }
  /**
   * Punishment settings
   */
  punishments: {
    levels: PunishmentLevel[]
    expires: number | null
    allow: number
    log: Snowflake | null
  }
  /**
   * Resend options
   */
  resend: {
    enabled: boolean
    separate: boolean
    replace: WebhookReplace
  }
  prefix: string | null
  dm: boolean

  v: number

  /**
   * Whether or not the entry is in the database or not
   */
  notInDb?: boolean
}

export interface UserPremium {
  /**
   * Amount of premium servers this user has
   */
  count: number
  /**
   * Guilds that are premium for this users
   */
  guilds: Snowflake[]
  /**
   * Whether or not a user is a customer or a patron
   */
  customer: boolean
}

export interface PremiumUserSchema {
  id: Snowflake
  guilds: Snowflake[]
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
  premium?: UserPremium & { trial: boolean }
  /**
   * Whether or not user is admin
   */
  admin?: boolean
  /**
   * Email of the user
   */
  email?: string | null

  _id?: string
  bearer?: string
}

export interface ShortGuild {
  /**
   * ID of guild
   */
  id: Snowflake
  /**
   * Name of guild
   */
  name: string
  /**
   * Whether or not the bot is in the server
   */
  joined: boolean
  /**
   * Group, if any, to categorize the server
   */
  group?: string
  /**
   * CDN Hash of icon
   */
  icon: string | null
}

export interface DashboardChannel {
  id: Snowflake
  name: string
  type: number
  parent_id?: Snowflake | null
}

export interface DashboardRole {
  id: Snowflake
  name: string
  color: number
}

export interface ExtendedGuild extends ShortGuild {
  /**
   * Array of channels
   */
  channels: DashboardChannel[]
  /**
   * Array of roles
   */
  roles: DashboardRole[]
  /**
   * Permissions bit
   */
  permissions: number
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
   * The time in which the trial will expire (always null if the guild is premium)
   */
  trial: number | null
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

export type AdminResponse = Array<{
  cluster: Cluster
  shards: Shard[]
}>

/**
 * 3 character temporary identifier
 */
export type ShortID = `${string}${string}${string}`
