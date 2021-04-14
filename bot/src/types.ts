import { Snowflake } from 'discord-api-types'

export const Reloaders = ['COMMANDS', 'FILTER', 'CACHE'] as const

type ReloadNames = typeof Reloaders[number]

declare module 'discord-rose/dist/clustering/ThreadComms' {
  interface ThreadEvents {
    RELOAD: {
      send: ReloadNames
      receive: ReloadNames
    }
    GUILD_DUMP: {
      send: Snowflake
      receive: null
    }
    RELOAD_WEBSOCKETS: {
      send: null
      receive: null
    }
  }
}
