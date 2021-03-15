import { Worker } from 'discord-rose'
import { Setup } from './BaseManager'

import { Config } from '../config'

import { Database } from '../structures/Database'
import { Filter } from '../structures/Filter'
import { ActionBucket } from '../structures/ActionBucket'
import { Responses } from '../structures/Responses'

import { Snowflake } from 'discord-api-types'

import { addHandlers } from '../helpers/clusterEvents'
import { setupFilters } from '../helpers/setupFilters'
import { setupDiscord } from '../helpers/discordEvents'

import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'

import adminMiddleware from '@discord-rose/admin-middleware'
import flagsMiddleware from '@discord-rose/flags-middleware'
import permissionsMiddleware from '@discord-rose/permissions-middleware'

import { CommandOptions } from 'discord-rose/dist/typings/lib'
import { PermissionsUtils, bits } from 'discord-rose/dist/utils/Permissions'

export class WorkerManager extends Worker {
  config: typeof Config
  filter = new Filter()
  db: Database

  actions = new ActionBucket(this)
  responses = new Responses(this)

  constructor () {
    super()
    Setup(this)

    this.setStatus('watching', 'Rewrite')

    this.commands
      .prefix(async (msg) => {
        return await this.db.config(msg.guild_id).then(x => x.prefix)
      })
      .middleware(flagsMiddleware())
      .middleware(adminMiddleware(async (id) => {
        return await this.isAdmin(id)
      }))
      .middleware(permissionsMiddleware())
      .middleware(async (ctx) => {
        ctx.db = await this.db.config(ctx.guild.id)

        return true
      })

    addHandlers(this)
    setupFilters(this)
    setupDiscord(this)

    console.log = (...msg: string[]) => this.comms.log(msg.join(' '))

    this.loadCommands()
  }

  public async isAdmin (id: Snowflake): Promise<boolean> {
    return await fetch('https://jpbbots.org/api/admin/' + id).then(async x => await x.text()).then(x => !!Number(x))
  }

  public loadCommands () {
    console.log('Loading commands')
    if (this.commands.commands.clear) this.commands.commands.clear()

    this._loadDir(path.resolve(__dirname, '../commands'))
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

      delete require.cache[require.resolve(path.resolve(dir, file.name))]
      const command: CommandOptions = require(path.resolve(dir, file.name)).default

      this.commands.add(command)
    }
  }

  hasPerms (id: Snowflake, perms: keyof typeof bits) {
    return PermissionsUtils.calculate(
      this.selfMember.get(id),
      this.guilds.get(id),
      this.guildRoles.get(id),
      perms
    )
  }
}
