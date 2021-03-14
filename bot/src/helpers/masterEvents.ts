import { MasterManager } from '../managers/Master'

import '../types'

export function addHandlers (master: MasterManager) {
  master.handlers.on('RELOAD', (cluster, str) => {
    master.tellAll('RELOAD', str)
  })
}