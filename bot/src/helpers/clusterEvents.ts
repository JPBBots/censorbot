import { WorkerManager } from '../managers/Worker'

import '../types'

export function addHandlers (worker: WorkerManager) {
  worker.comms.on('RELOAD', (reloading) => {
    switch (reloading) {
      case 'COMMANDS':
        worker.loadCommands()
        break
      case 'FILTER':
        break
    }
  })
}
