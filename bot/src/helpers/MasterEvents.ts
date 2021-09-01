import { ExtendedEmitter, Event } from '@jpbberry/typed-emitter'
import { Snowflake, ThreadEvents } from 'discord-rose'

import { ResolveFunction } from 'discord-rose/dist/clustering/ThreadComms'

import { MasterManager } from '../managers/Master'
import { ReloadNames } from '../types'

import GenerateID from '../utils/GenerateID'

export class MasterEvents extends ExtendedEmitter {
  constructor (private readonly master: MasterManager) {
    super()
  }

  @Event('RELOAD')
  reload (_cluster, name: ReloadNames): void {
    this.master.tellAll('RELOAD', name)
  }

  @Event('GUILD_DUMP')
  dumpGuild (_cluster, id: Snowflake): void {
    this.master.tellAll('GUILD_DUMP', id)
  }

  @Event('RELOAD_WEBSOCKETS')
  reloadWebsockets (): void {
    this.master.api.tell('RELOAD_WEBSOCKETS', null)
  }

  @Event('CREATE_HELPME')
  createHelpMe (_cluster, { id }: ThreadEvents['CREATE_HELPME']['send'], resolve: ResolveFunction<'CREATE_HELPME'>): void {
    const current = this.master.helpme.find(x => x.id === id)
    if (current) resolve(current.code)

    const code = GenerateID(this.master.helpme.keyArray())

    this.master.helpme.set(code, { code, id })

    resolve(code)
  }

  @Event('GET_HELPME')
  getHelpMe (_cluster, { code }: ThreadEvents['GET_HELPME']['send'], resolve: ResolveFunction<'GET_HELPME'>): void {
    const helpme = this.master.helpme.get(code)

    if (!helpme) return resolve({ error: 'Invalid HelpME Code' })

    resolve(helpme.id)
  }

  @Event('GUILD_UPDATED')
  guildUpdated (_cluster, guild: Snowflake): void {
    this.master.api.tell('GUILD_UPDATED', guild)
  }
}
