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