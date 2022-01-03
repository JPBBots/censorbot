import { WorkerManager } from '../managers/Worker'

import { ExtendedEmitter, Event } from '@jpbberry/typed-emitter'

import path from 'path'
import { ReloadNames } from '../types'
import { Snowflake } from 'jadl'
import { ResolveFunction } from 'jadl/dist/clustering/ThreadComms'

const filterDataDir = path.resolve(__dirname, '../structures/Filter')

const rem = (path): void => {
  delete require.cache[require.resolve(path)]
}

export class ClusterEvents extends ExtendedEmitter {
  constructor(private worker: WorkerManager) {
    super()
  }

  @Event('RELOAD')
  reloadComponent(reloading: ReloadNames): void {
    switch (reloading) {
      case 'COMMANDS':
        // this.worker.loadCommands() TODO
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
        break
    }
  }

  @Event('IN_GUILDS')
  inGuilds(guilds: Snowflake[], resolve: ResolveFunction<'IN_GUILDS'>) {
    resolve(guilds.filter((x) => this.worker.guilds.has(x)))
  }

  @Event('UPDATE_CUSTOM_BOTS')
  updateCustomBots() {
    void this.worker.updateCustomBots()
  }
}
