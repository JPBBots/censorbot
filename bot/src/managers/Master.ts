import { Master } from 'discord-rose'

import { Setup } from './BaseManager'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

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
    Setup(this)

    this.start()
  }
}
