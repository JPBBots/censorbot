import { MasterManager } from '../managers/Master'

import '../types'

export function addHandlers (master: MasterManager): void {
  master.handlers.on('RELOAD', (cluster, str) => {
    master.tellAll('RELOAD', str)
  })
}
