import { Snowflake } from 'discord-api-types'

export function guildShard(id: Snowflake, totalShards: number): number {
  return Number((BigInt(id) >> BigInt(22)) % BigInt(totalShards))
}
