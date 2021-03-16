import { Master } from 'discord-rose'

import { Setup } from './BaseManager'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

import { addHandlers } from '../helpers/masterEvents'

export class MasterManager extends Master {
  config: typeof Config
  db: Database

  constructor () {
    super(path.resolve(__dirname, '../.run/worker.js'), {
      token: Config.token,
      cacheControl: {
        guilds: ['name', 'owner_id', 'region', 'unavailable', 'member_count'],
        channels: ['type', 'name', 'nsfw'],
        roles: ['managed', 'permissions', 'name']
      }
    })
    void Setup(this)

    addHandlers(this)

    const started = Date.now()
    void this.start()
      .then(() => {
        this.log(`Startup took ${((Date.now() - started) / 1000).toFixed(2)}s`)
      })
  }
}
