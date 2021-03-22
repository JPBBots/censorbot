export const Reloaders = ['COMMANDS', 'FILTER', 'CACHE'] as const

type ReloadNames = typeof Reloaders[number]

declare module 'discord-rose/dist/clustering/ThreadComms' {
  interface ThreadEvents {
    RELOAD: {
      send: ReloadNames
      receive: ReloadNames
    }
  }
}
