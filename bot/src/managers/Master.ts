import { Master, Cluster, Snowflake } from 'discord-rose'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

import { addHandlers } from '../helpers/masterEvents'
import { Cache } from '@jpbberry/cache'
import { ShortID } from 'typings'

export class MasterManager extends Master {
  config = Config
  db = new Database()
  api: Cluster

  helpme: Cache<ShortID, { code: ShortID, id: Snowflake }> = new Cache(5e5)

  constructor () {
    super(path.resolve(__dirname, '../.run/worker.js'), {
      token: Config.token,
      cacheControl: {
        guilds: ['name', 'icon', 'owner_id', 'region', 'unavailable', 'member_count'],
        channels: ['type', 'name', 'nsfw', 'permission_overwrites'],
        roles: ['managed', 'permissions', 'name']
      },
      intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS'],
      shards: 2,
      shardsPerCluster: 1,
      rest: {
        version: 9
      }
    })

    addHandlers(this)

    this.api = this.spawnProcess('API', path.resolve(__dirname, '../.run/api.js'))

    void this.start()
  }
}