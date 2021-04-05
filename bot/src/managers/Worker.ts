import { Worker, CommandOptions, PermissionsUtils } from 'discord-rose'
import { Config } from '../config'

import { Database } from '../structures/Database'
import { Filter } from '../structures/Filter'
import { ActionBucket } from '../structures/ActionBucket'
import { Responses } from '../structures/Responses'

import { APIRole, GatewayGuildMemberAddDispatchData, Snowflake } from 'discord-api-types'

import { addHandlers } from '../helpers/clusterEvents'
import { setupFilters } from '../helpers/setupFilters'
import { setupDiscord } from '../helpers/discordEvents'

import { Interface } from 'interface'
import EvalCommand from 'interface/dist/extras/EvalCommand'

import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'

import { CachedGuild } from 'discord-rose/dist/typings/Discord'
import Collection from '@discordjs/collection'

export class WorkerManager extends Worker {
  config = Config
  filter = new Filter()
  db = new Database()

  actions = new ActionBucket(this)
  responses = new Responses(this)

  interface = new Interface()

  constructor () {
    super()

    this.interface.setupWorker(this)

    this.setStatus('watching', 'Rewrite')

    this.commands
      .prefix(async (msg): Promise<string | string[]> => {
        const prefix = await this.db.config(msg.guild_id as Snowflake).then(x => x.prefix)
        // @ts-expect-error
        if (!prefix) return null
        return prefix
      })
      .middleware(async (ctx) => {
        if (!ctx.guild) return true
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
    return await fetch(`https://jpbbots.org/api/admin/${id}`).then(async x => await x.text()).then(x => !!Number(x))
  }

  public loadCommands (): void {
    console.log('Loading commands')
    if (this.commands.commands) this.commands.commands.clear()

    this.commands.add(EvalCommand)

    void this._loadDir(path.resolve(__dirname, '../commands'))
  }

  private async _loadDir (dir: string): Promise<void> {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        await this._loadDir(path.resolve(dir, file.name))
        continue
      }

      const [, ext] = file.name.split('.')
      if (ext !== 'js') continue

      delete require.cache[require.resolve(path.resolve(dir, file.name))]
      const command: { default: CommandOptions } = await import(path.resolve(dir, file.name))
      this.commands.add(command.default)
    }
  }

  hasPerms (id: Snowflake, perms: keyof typeof PermissionsUtils.bits): boolean {
    return PermissionsUtils.calculate(
      this.selfMember.get(id) as GatewayGuildMemberAddDispatchData,
      this.guilds.get(id) as CachedGuild,
      this.guildRoles.get(id) as Collection<Snowflake, APIRole>,
      perms
    )
  }
}
