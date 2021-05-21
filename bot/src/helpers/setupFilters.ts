import { WorkerManager } from '../managers/Worker'

export function setupFilters (worker: WorkerManager): void {
  worker.on('MESSAGE_CREATE', (msg) => {
    void worker.methods.msg(worker, msg)
  })
  worker.on('MESSAGE_UPDATE', (msg) => {
    void worker.methods.msg(worker, msg)
  })
  worker.on('GUILD_MEMBER_UPDATE', (data) => {
    void worker.methods.names(worker, data)
  })
  worker.on('GUILD_MEMBER_ADD', (data) => {
    void worker.methods.names(worker, data)
  })
  worker.on('MESSAGE_REACTION_ADD', (data) => {
    void worker.methods.react(worker, data)
  })
}
