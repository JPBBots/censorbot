import { GuildDB } from 'typings/api'
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

import adminMiddleware from '@discord-rose/admin-middleware'
import flagsMiddleware from '@discord-rose/flags-middleware'
import permissionsMiddleware from '@discord-rose/permissions-middleware'
