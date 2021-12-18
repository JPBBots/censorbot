import { ExtendedEmitter, Event } from '@jpbberry/typed-emitter'
import { Snowflake, ThreadEvents } from 'jadl'

import { ResolveFunction } from 'jadl/dist/clustering/ThreadComms'

import { MasterManager } from '../managers/Master'
import { ReloadNames } from '../types'

import GenerateID from '../utils/GenerateID'

export class MasterEvents extends ExtendedEmitter {
  constructor(private readonly master: MasterManager) {
    super()
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

    const code = GenerateID(this.master.helpme.keyArray())

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
      .catch((err) => {
        resolve({ error: err.message })
      })
  }

  @Event('IN_GUILDS')
  async inGuilds(
    _cluster,
    data: ThreadEvents['IN_GUILDS']['send'],
    resolve: ResolveFunction<'IN_GUILDS'>
  ) {
    const clusters: Array<{ cluster: string; ids: Snowflake[] }> = []
    data.forEach((id) => {
      const cluster = this.master.guildToCluster(id)

      let clusterObject = clusters.find((x) => x.cluster === cluster.id)
      if (!clusterObject) {
        clusterObject = {
          cluster: cluster.id,
          ids: []
        }

        clusters.push(clusterObject)
      }

      clusterObject.ids.push(id)
    })

    const result: Snowflake[] = []

    for (const cluster of clusters) {
      const ids = await this.master.clusters
        .get(cluster.cluster)
        ?.sendCommand('IN_GUILDS', cluster.ids)

      if (ids) result.push(...ids)
    }

    resolve(result)
  }
}
