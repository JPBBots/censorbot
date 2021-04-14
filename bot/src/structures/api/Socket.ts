import { Cache } from '@jpbberry/cache'
import { Snowflake } from 'discord-api-types'
import { ShortGuild } from 'typings'
import { Server } from 'ws'
import { Config } from '../../config'
import { ApiManager } from '../../managers/Api'

import { Connection } from './Connection'
import { GuildHandler } from './GuildHandler'

export class Socket extends Server {
  connections: Set<Connection> = new Set()
  guilds = new GuildHandler(this)

  cachedShortGuilds: Cache<Snowflake, ShortGuild[]> = new Cache(Config.dashboardOptions.guildCacheWipeTimeout)

  constructor (public manager: ApiManager) {
    super({
      port: 3191,
      clientTracking: false
    }, () => {
      manager.log('WS Open')
    })

    this.on('connection', (ws, req) => {
      if (!req.headers.origin) return ws.terminate()
      const user = new Connection(this, ws, req.headers.origin)

      this.connections.add(user)
    })
  }

  handleClose (con: Connection): void {
    this.connections.delete(con)
  }
}
