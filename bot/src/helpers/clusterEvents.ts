import { WorkerManager } from '../managers/Worker'

import '../types'
import path from 'path'

const filterDataDir = path.resolve(__dirname, '../structures/Filter')

const methods = {
  msg: path.resolve(__dirname, '../filters/Messages'),
  names: path.resolve(__dirname, '../filters/Names'),
  reacts: path.resolve(__dirname, '../filters/Reactions')
}

const rem = (path): void => {
  delete require.cache[require.resolve(path)]
}

export function addHandlers (worker: WorkerManager): void {
  worker.comms.on('RELOAD', (reloading) => {
    switch (reloading) {
      case 'COMMANDS':
        worker.loadCommands()
        break
      case 'FILTER':
        rem(filterDataDir)
        void import(filterDataDir).then(({ Filter }) => {
          worker.filter = new Filter()
        })
        break
      case 'CACHE':
        worker.db.configCache.clear()
        worker.actions.webhooks.clear()
        worker.actions.popups.clear()
        break
      case 'FILTERS':
        rem(methods.msg)
        rem(methods.names)
        rem(methods.reacts)

        void import(methods.msg).then(({ MessageHandler }) => {
          worker.methods.msg = MessageHandler
        })
        void import(methods.names).then(({ NameHandler }) => {
          worker.methods.names = NameHandler
        })
        void import(methods.reacts).then(({ ReactionHandler }) => {
          worker.methods.react = ReactionHandler
        })

        break
    }
  })

  worker.comms.on('GUILD_DUMP', (id) => {
    worker.db.configCache.delete(id)
  })
}
