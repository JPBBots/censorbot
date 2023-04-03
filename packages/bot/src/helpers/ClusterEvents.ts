import { WorkerManager } from '../managers/Worker'

import { Event } from '@jpbberry/typed-emitter'

import path from 'path'
import { ReloadNames } from '@censorbot/typings'
import { PermissionUtils, Snowflake, Thread } from 'jadl'
import { ResolveFunction } from 'jadl/dist/clustering/ThreadComms'
import { EventAdder } from '@censorbot/utils'

const filterDataDir = path.resolve(__dirname, '../structures/Filter')

const rem = (path): void => {
  delete require.cache[require.resolve(path)]
}

export class ClusterEvents extends EventAdder<Thread> {
  constructor(private worker: WorkerManager) {
    super(worker.comms)
  }

  @Event('RELOAD')
  reloadComponent(reloading: ReloadNames): void {
    switch (reloading) {
      case 'COMMANDS':
        // this.worker.loadCommands() TODO
        break
      case 'FILTER':
        rem(filterDataDir)
        void import(filterDataDir).then(({ Filter }) => {
          this.worker.filter = new Filter()
        })
        break
      case 'CACHE':
        this.worker.db.configCache.clear()
        this.worker.actions.webhooks.clear()
        this.worker.actions.popups.clear()
        break
      case 'FILTERS':
        break
    }
  }

  @Event('GUILD_GET')
  getGuild(guildId: Snowflake, resolve: ResolveFunction<'GUILD_GET'>) {
    const guild = Object.assign({}, this.worker.guilds.get(guildId))

    if (!guild || !guild.id) return resolve({ error: 'Not in guild' })

    resolve({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      joined: true,
      channels: this.worker.channels
        .filter((x) => 'guild_id' in x && x.guild_id === guild.id)
        .array()
        .map((x) => ({
          id: x.id,
          name: x.name ?? '',
          type: x.type,
          parent_id: 'parent_id' in x ? x.parent_id : undefined
        })),
      roles: (this.worker.guildRoles.get(guild.id)?.array() ?? [])
        .filter((x) => !x.managed && x.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map((x) => ({
          id: x.id,
          name: x.name,
          color: x.color
        })),
      permissions: Number(
        PermissionUtils.combine({
          guild: guild,
          member: this.worker.selfMember.get(guildId)!,
          roleList: this.worker.guildRoles.get(guildId)
        })
      )
    })
  }

  @Event('IN_GUILDS')
  inGuilds(guilds: Snowflake[], resolve: ResolveFunction<'IN_GUILDS'>) {
    resolve(guilds.filter((x) => this.worker.guilds.has(x)))
  }

  @Event('UPDATE_CUSTOM_BOTS')
  updateCustomBots() {
    void this.worker.updateCustomBots()
  }

  @Event('UPDATE_FILTER')
  updateFilter() {
    void this.worker.updateFilters()
  }
}
