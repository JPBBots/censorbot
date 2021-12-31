import { Snowflake } from 'discord-api-types'

export class SnowflakeUtil {
  static EPOCH = 1420070400000

  static getTimestamp(snowflake: Snowflake) {
    return new Date(Number(BigInt(snowflake) >> 22n) + this.EPOCH)
  }
}
