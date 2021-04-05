import { Master } from 'discord-rose'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

import { addHandlers } from '../helpers/masterEvents'
import { Cluster } from 'discord-rose/dist/clustering/master/Cluster'

export class MasterManager extends Master {
  config = Config
  db = new Database()
  api: Cluster

  constructor () {
    super(path.resolve(__dirname, '../.run/worker.js'), {
      token: Config.token,
      cacheControl: {
        guilds: ['name', 'icon', 'owner_id', 'region', 'unavailable', 'member_count'],
        channels: ['type', 'name', 'nsfw'],
        roles: ['managed', 'permissions', 'name']
      },
      intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS']
    })

    addHandlers(this)

    this.api = this.spawnProcess('API', path.resolve(__dirname, '../.run/api.js'))

    void this.start()
  }
}
