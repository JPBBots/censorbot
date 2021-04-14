import { WorkerManager } from '../managers/Worker'

import '../types'
import path from 'path'

const filterDataDir = path.resolve(__dirname, '../structures/Filter')

export function addHandlers (worker: WorkerManager): void {
  worker.comms.on('RELOAD', (reloading) => {
    switch (reloading) {
      case 'COMMANDS':
        worker.loadCommands()
        break
      case 'FILTER':
        delete require.cache[require.resolve(filterDataDir)]
        void import(filterDataDir).then(({ Filter }) => {
          worker.filter = new Filter()
        })
        break
      case 'CACHE':
        worker.db.configCache.clear()
        worker.actions.webhooks.clear()
        worker.actions.popups.clear()
        break
    }
  })

  worker.comms.on('GUILD_DUMP', (id) => {
    worker.db.configCache.delete(id)
  })
}
