import { Snowflake } from 'discord-api-types'

export interface CustomBotOptions {
  name: string
  token: string
  id: Snowflake
  guilds: Snowflake[]
  customStatus: [
    'playing' | 'streaming' | 'listening' | 'watching' | 'competing',
    string
  ]
}
