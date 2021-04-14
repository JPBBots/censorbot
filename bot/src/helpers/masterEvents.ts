import { MasterManager } from '../managers/Master'

import '../types'

export function addHandlers (master: MasterManager): void {
  master.handlers.on('RELOAD', (cluster, str) => {
    master.tellAll('RELOAD', str)
  })
  master.handlers.on('GUILD_DUMP', (cluster, id) => {
    master.tellAll('GUILD_DUMP', id)
  })
  master.handlers.on('RELOAD_WEBSOCKETS', () => {
    master.api.tell('RELOAD_WEBSOCKETS', null)
  })
}
