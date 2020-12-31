type Snowflake = string

interface User {
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
   * Whether or not user is admin
   */
  admin: boolean
}

interface ShortGuild {
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

type filterType = 'en' | 'es' | 'off' | 'de' | 'ru'

interface GuildDB {
  id: Snowflake
  filters: filterType[]
  censor: {
    msg: boolean
    emsg: boolean
    nick: boolean
    react: boolean
  }
  log?: Snowflake
  role?: Snowflake
  filter: string[]
  uncensor: string[]
  msg: {
    content?: string|false
    deleteAfter?: number
  }
  punishment: {
    type: 0 | 1 | 2 | 3
    amount: number
    role?: Snowflake
    time: number
    expires?: number
  }
  webhook: {
    enabled: boolean
    separate: boolean
    replace: 0 | 1 | 2
  }
  multi: boolean
  prefix?: string
  channels: Snowflake[]
  nsfw: boolean
  invites: boolean
  fonts: boolean
  dm: boolean
}

interface ExtendedGuild extends ShortGuild {
  /**
   * Array of channels
   */
  c: {id: Snowflake, name: string}[]
  /**
   * Array of roles
   */
  r: {id: Snowflake, name: string}[]
}

interface GuildData {
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