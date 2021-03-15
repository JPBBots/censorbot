import { WorkerManager } from '../managers/Worker'

import '../types'

const filterDataDir = require('path').resolve(__dirname, '../structures/Filter')

export function addHandlers (worker: WorkerManager) {
  worker.comms.on('RELOAD', async (reloading) => {
    switch (reloading) {
      case 'COMMANDS':
        worker.loadCommands()
        break
      case 'FILTER':
        delete require.cache[require.resolve(filterDataDir)]
        const Filter = require(filterDataDir).Filter
        worker.filter = new Filter()
        break
    }
  })
}
