import { Thread, RestManager } from 'discord-rose'

import { Config } from '../config'

import { Database } from '../structures/Database'

import { Socket } from '../structures/api/Socket'
import { OAuth2 } from '../structures/api/OAuth2'
import { RouterManager } from '../structures/api/RouterManager'
import { ChargeBee } from '../structures/api/ChargeBee'

import { Interface } from 'interface'

import { User } from 'typings/api'
import { Region } from 'typings/websocket'

import { Filter } from '../structures/Filter'

import http from 'http'

export class ApiManager {
  config = Config
  db = new Database()
  interface = new Interface()

  id = 0 // for future scale
  region: Region = 'na'

  thread = new Thread()
  rest = new RestManager(Config.token, {
    version: 9
  })

  filter = new Filter()
  chargebee = new ChargeBee(this)

  router = new RouterManager(this)

  server = http.createServer(this.router.app)

  socket = new Socket(this)
  oauth = new OAuth2(this)

  constructor () {
    this.thread.on('RELOAD_WEBSOCKETS', () => {
      this.socket.connections.forEach(client => client.sendEvent('RELOAD', null))
    })

    this.server.listen(this.config.dashboardOptions.port)
  }

  log (..._): void {
    this.thread.log(..._)
  }

  async extendUser (user: User): Promise<User> {
    user.admin = false // await this.interface.api.isAdmin(user.id)
    const prem = await this.chargebee.getAmount(user.id)

    const premium = {
      count: 0,
      guilds: [],
      customer: false
    }
    if (prem) {
      premium.count = prem.amount
      premium.customer = prem.customer

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
