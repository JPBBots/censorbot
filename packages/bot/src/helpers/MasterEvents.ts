import { Event } from '@jpbberry/typed-emitter'
import { Cluster, Snowflake, ThreadEvents } from 'jadl'

import { ResolveFunction } from 'jadl/dist/clustering/ThreadComms'

import { MasterManager } from '../managers/Master'
import { ReloadNames } from '@censorbot/typings'
import { EventAdder, generateShortId } from '@censorbot/utils'

import { CustomBotManager } from './CustomBotManager'

export class MasterEvents extends EventAdder<any> {
  constructor(private readonly master: MasterManager) {
    super(master.handlers)
  }

  @Event('RELOAD')
  reload(_cluster, name: ReloadNames): void {
    this.master.tellAll('RELOAD', name)
  }

  @Event('GUILD_DUMP')
  dumpGuild(_cluster, id: Snowflake): void {
    this.master.tellAll('GUILD_DUMP', id)
  }

  @Event('RELOAD_WEBSOCKETS')
  reloadWebsockets(): void {
    this.master.api.tell('RELOAD_WEBSOCKETS', null)
  }

  @Event('CREATE_HELPME')
  createHelpMe(
    _cluster,
    { id }: ThreadEvents['CREATE_HELPME']['send'],
    resolve: ResolveFunction<'CREATE_HELPME'>
  ): void {
    const current = this.master.helpme.find((x) => x.id === id)
    if (current) resolve(current.code)

    const code = generateShortId(this.master.helpme.keyArray())

    this.master.helpme.set(code, { code, id })

    resolve(code)
  }

  @Event('GET_HELPME')
  getHelpMe(
    _cluster,
    { code }: ThreadEvents['GET_HELPME']['send'],
    resolve: ResolveFunction<'GET_HELPME'>
  ): void {
    const helpme = this.master.helpme.get(code)

    if (!helpme) return resolve({ error: 'Invalid HelpME Code' })

    resolve(helpme.id)
  }

  @Event('GUILD_UPDATED')
  guildUpdated(_cluster, guild: Snowflake): void {
    this.master.api.tell('GUILD_UPDATED', guild)
  }

  @Event('GUILD_GET')
  guildGet(
    _cluster,
    guild: Snowflake,
    resolve: ResolveFunction<'GUILD_GET'>
  ): void {
    void this.master
      .guildToCluster(guild)
      .sendCommand('GUILD_GET', guild)
      .then((guildInfo) => resolve(guildInfo))
  }

  @Event('GUILD_DELETED')
  guildDeleted(_cluster, guild: Snowflake) {
    void this.master.api.tell('GUILD_DELETED', guild)
  }

  @Event('SEND_WEBHOOK')
  sendWebhook(
    _cluster,
    data: ThreadEvents['SEND_WEBHOOK']['send'],
    resolve: ResolveFunction<'SEND_WEBHOOK'>
  ) {
    this.master.requests
      .sendWebhookMessage(data.id, data.token, data.data as any)
      .then((x) => {
        resolve(x)
      })
      .catch((err) => {})
  }

  @Event('IN_GUILDS')
  async inGuilds(
    _cluster,
    data: ThreadEvents['IN_GUILDS']['send'],
    resolve: ResolveFunction<'IN_GUILDS'>
  ) {
    const clusters: Array<{
      cluster: CustomBotManager | Cluster
      ids: Snowflake[]
    }> = []
    data.forEach((id) => {
      const cluster = this.master.guildToCluster(id)

      let clusterObject = clusters.find((x) => x.cluster.id === cluster.id)
      if (!clusterObject) {
        clusterObject = {
          cluster,
          ids: []
        }

        clusters.push(clusterObject)
      }

      clusterObject.ids.push(id)
    })

    const result: Snowflake[] = []

    for (const cluster of clusters) {
      const ids = await cluster.cluster?.sendCommand('IN_GUILDS', cluster.ids)

      if (ids) result.push(...ids)
    }

    resolve(result)
  }

  @Event('UPDATE_CUSTOM_BOTS')
  updateCustomBots() {
    void this.master.tellAll('UPDATE_CUSTOM_BOTS', null, true)
  }

  @Event('STATUS_UPDATE')
  statusUpdate() {
    void this.master.api.tell('STATUS_UPDATE', null)
  }

  @Event('UPDATE_FILTER')
  updateFilter() {
    this.master.tellAll('UPDATE_FILTER', null, true)
  }
}
