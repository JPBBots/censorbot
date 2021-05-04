import { Thread, RestManager } from 'discord-rose'

import { Config } from '../config'

import { Database } from '../structures/Database'

import { Socket } from '../structures/api/Socket'
import { OAuth2 } from '../structures/api/OAuth2'

import { Interface } from 'interface'
import { User } from 'typings/api'
import { Region } from 'typings/websocket'
import { Filter } from '../structures/Filter'

export class ApiManager {
  config = Config
  db = new Database()
  interface = new Interface()

  id = 0 // for future scale
  region: Region = 'na'

  thread = new Thread()
  rest = new RestManager(Config.token)
  filter = new Filter()

  server = new Socket(this)
  oauth = new OAuth2(this)

  constructor () {
    this.thread.on('RELOAD_WEBSOCKETS', () => {
      this.server.connections.forEach(client => client.sendEvent('RELOAD', null))
    })
  }

  log (..._): void {
    this.thread.log(..._)
  }

  async extendUser (user: User): Promise<User> {
    user.admin = await this.interface.api.isAdmin(user.id)
    const isPremium = await this.interface.api.getPremium(user.id)

    const premium = {
      count: 0,
      guilds: []
    }
    if (isPremium) {
      premium.count = isPremium

      let premiumUser = await this.db.collection('premium_users').findOne({ id: user.id })
      if (!premiumUser) {
        premiumUser = {
          id: user.id,
          guilds: []
        }
        await this.db.collection('premium_users').updateOne({ id: user.id }, { $set: premiumUser }, { upsert: true })
      }
      premium.guilds = premiumUser.guilds
    }

    user.premium = premium

    return user
  }
}
