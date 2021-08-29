import { Master, Cluster, Snowflake } from 'discord-rose'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

import { MasterEvents } from '../helpers/MasterEvents'

import { Cache } from '@jpbberry/cache'
import { ShortID } from 'typings'

import AutoPoster from 'topgg-autoposter'

import { Interface } from '@jpbbots/interface'

const int = new Interface()

export class MasterManager extends Master {
  config = Config
  db = new Database()
  api: Cluster

  private readonly _handleEvents = new MasterEvents(this)

  helpme: Cache<ShortID, { code: ShortID, id: Snowflake }> = new Cache(5e5)

  constructor () {
    super(path.resolve(__dirname, '../.run/worker.js'), {
      token: Config.token,
      cache: {
        channels: ['text', 'category']
      },
      cacheControl: {
        guilds: ['name', 'icon', 'owner_id', 'region', 'unavailable', 'member_count', 'threads'],
        channels: ['type', 'name', 'nsfw', 'permission_overwrites', 'parent_id'],
        roles: ['managed', 'permissions', 'name', 'position', 'color']
      },
      intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS'],
      rest: {
        version: 9
      }
    })

    if (!this.config.staging) {
      int.setupMaster(this, 'censorbot')

      AutoPoster(Config.dbl, this)
    }

    this._handleEvents.add(this.handlers as any)

    this.api = this.spawnProcess('API', path.resolve(__dirname, '../.run/api.js'))

    void this.start()
  }
}
