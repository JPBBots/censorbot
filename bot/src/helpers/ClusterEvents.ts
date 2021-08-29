import { WorkerManager } from '../managers/Worker'

import { ExtendedEmitter, Event } from '@jpbberry/typed-emitter'

import path from 'path'
import { ReloadNames } from '../types'
import { Snowflake } from 'discord-rose'

const filterDataDir = path.resolve(__dirname, '../structures/Filter')

const methods = {
  msg: path.resolve(__dirname, '../filters/Messages'),
  names: path.resolve(__dirname, '../filters/Names'),
  reacts: path.resolve(__dirname, '../filters/Reactions')
}

const rem = (path): void => {
  delete require.cache[require.resolve(path)]
}

export class ClusterEvents extends ExtendedEmitter {
  constructor (private worker: WorkerManager) {
    super()
  }

  @Event('RELOAD')
  reloadComponent (reloading: ReloadNames): void {
    switch (reloading) {
      case 'COMMANDS':
        this.worker.loadCommands()
        break
      case 'FILTER':
        rem(filterDataDir)
        void import(filterDataDir).then(({ Filter }) => {
          this.worker.filter = new Filter()
        })
        break
      case 'CACHE':
        this.worker.db.configCache.clear()
        this.worker.actions.webhooks.clear()
        this.worker.actions.popups.clear()
        break
      case 'FILTERS':
        rem(methods.msg)
        rem(methods.names)
        rem(methods.reacts)

        void import(methods.msg).then(({ MessageHandler }) => {
          this.worker.methods.msg = MessageHandler
        })
        void import(methods.names).then(({ NameHandler }) => {
          this.worker.methods.names = NameHandler
        })
        void import(methods.reacts).then(({ ReactionHandler }) => {
          this.worker.methods.react = ReactionHandler
        })

        break
    }
  }

  @Event('GUILD_DUMP')
  dumpGuild (id: Snowflake): void {
    this.worker.db.configCache.delete(id)
  }
}
