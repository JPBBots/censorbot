import { GuildDB } from '../../../typings/typings'
import { WorkerManager } from '../managers/Worker'

new WorkerManager()

declare module 'discord-rose/dist/typings/lib' {
  type worker = WorkerManager
  interface CommandOptions {
    description: string
  }
  interface CommandContext {
    db: GuildDB
  }
}