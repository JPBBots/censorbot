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

interface ExtendedGuild extends ShortGuild {
  /**
   * Array of channel IDs
   */
  c: Snowflake[]
  /**
   * Array of role IDs
   */
  r: Snowflake[]
}