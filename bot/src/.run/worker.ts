import { WorkerManager } from '../managers/Worker'
import { CommandContext as CM } from '../structures/CommandContext'

const worker = new WorkerManager()

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
import { CommandError } from 'discord-rose'

process.on('unhandledRejection', (err: CommandError|Error) => {
  if ((err as CommandError).nonFatal) return

  console.error(err)
  worker.logError(err as Error)
})

global.ROSE_DEFAULT_EMBED.color = 0xea5455
