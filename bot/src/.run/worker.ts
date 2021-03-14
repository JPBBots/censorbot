import { WorkerManager } from '../managers/Worker'

new WorkerManager()

declare module 'discord-rose/dist/typings/lib' {
  type worker = WorkerManager
}