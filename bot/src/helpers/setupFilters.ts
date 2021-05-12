import { WorkerManager } from '../managers/Worker'

import { MessageHandler } from '../filters/Messages'
import { NameHandler } from '../filters/Names'
import { ReactionHandler } from '../filters/Reactions'

export function setupFilters (worker: WorkerManager): void {
  worker.on('MESSAGE_CREATE', (msg) => {
    void MessageHandler(worker, msg)
  })
  worker.on('MESSAGE_UPDATE', (msg) => {
    void MessageHandler(worker, msg)
  })
  worker.on('GUILD_MEMBER_UPDATE', (data) => {
    void NameHandler(worker, data)
  })
  worker.on('GUILD_MEMBER_ADD', (data) => {
    void NameHandler(worker, data)
  })
  worker.on('MESSAGE_REACTION_ADD', (data) => {
    void ReactionHandler(worker, data)
  })
}
