import { Thread, RestManager } from 'discord-rose'

import { Setup } from './BaseManager'

import { Config } from '../config'

import { Database } from '../structures/Database'

import { Socket } from '../structures/api/Socket'
import { OAuth2 } from '../structures/api/OAuth2'

export class ApiManager {
  config: typeof Config
  db: Database

  thread = new Thread()
  rest = new RestManager(Config.token)

  server = new Socket(this)
  oauth = new OAuth2(this)

  constructor () {
    void Setup(this)
  }

  log (..._): void {
    this.thread.log(..._)
  }
}
