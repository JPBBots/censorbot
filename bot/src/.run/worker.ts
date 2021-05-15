import { WorkerManager } from '../managers/Worker'
import { CommandContext as CM } from '../structures/CommandContext'

new WorkerManager()

declare module 'discord-rose/dist/typings/lib' {
  type worker = WorkerManager
  interface CommandOptions {
    description?: string
  }
  interface CommandContext extends CM {}
}

import adminMiddleware from '@discord-rose/admin-middleware'
import flagsMiddleware from '@discord-rose/flags-middleware'
import permissionsMiddleware from '@discord-rose/permissions-middleware'
