import { MasterManager } from '../managers/Master'
import GenerateID from '../utils/GenerateID'

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
  master.handlers.on('CREATE_HELPME', (cluster, { id }, resolve) => {
    const current = master.helpme.find(x => x.id === id)
    if (current) resolve(current.code)

    const code = GenerateID(master.helpme.keyArray())

    master.helpme.set(code, { code, id })

    resolve(code)
  })
  master.handlers.on('GET_HELPME', (cluster, data, resolve) => {
    const helpme = master.helpme.get(data.code)

    if (!helpme) return resolve({ error: 'Invalid HelpME Code' })

    resolve(helpme.id)
  })
}
