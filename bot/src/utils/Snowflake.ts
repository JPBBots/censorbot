import { Snowflake } from 'discord-api-types'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SnowflakeUtil {
  static EPOCH = 1420070400000

  static getTimestamp(snowflake: Snowflake): Date {
    return new Date(Number(BigInt(snowflake) >> 22n) + this.EPOCH)
  }
}
