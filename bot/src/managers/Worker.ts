import { Worker } from 'discord-rose'
import { Setup } from './BaseManager'

import { Config } from '../config'
import { Database } from '../structures/Database'
import { Snowflake } from 'discord-api-types'

import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'

import adminMiddleware from '@discord-rose/admin-middleware'
import flagsMiddleware from '@discord-rose/flags-middleware'
import { CommandOptions } from 'discord-rose/dist/typings/lib'

export class WorkerManager extends Worker {
  config: typeof Config
  db: Database

  constructor () {
    super()
    Setup(this)

    this.setStatus('watching', 'Rewrite')

    this.commands
      .setPrefix((msg) => {
        return this.db.config(msg.guild_id).then(x => x.prefix)
      })
      .middleware(flagsMiddleware())
      .middleware(adminMiddleware((id) => {
        return this.isAdmin(id)
      }))

    this._loadDir(path.resolve(__dirname, '../commands'))
  }

  public async isAdmin (id: Snowflake): Promise<boolean> {
    return fetch('https://jpbbots.org/api/admin/' + id).then(x => x.text()).then(x => !!Number(x))
  }

  private _loadDir (dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        this._loadDir(path.resolve(dir, file.name))
        continue
      }

      const [name, ext] = file.name.split('.')
      if (ext !== 'js') continue

      const command: CommandOptions = require(path.resolve(dir, file.name)).default
      
      this.commands.add(command)
    }
  }
}