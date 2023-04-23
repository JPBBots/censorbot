import { MetaObject, ShortGuild, WebSocketEventMap } from '@censorbot/typings'
import { Logger } from './Logger'

import headlessHandlers from './headlessHandler'
import { stats } from './StatsManager'

import { Event, ExtendedEmitter } from '@jpbberry/typed-emitter'
import { store } from 'store'
import {
  setCurrentGuild,
  setDb,
  setNeedsInvite,
  setOfflineInShard
} from 'store/reducers/guild.reducer'
import { setGuilds, setUser } from 'store/reducers/user.reducer'

import { io } from 'socket.io-client'
import { Api } from './Api'
import { setLoading } from '@/store/reducers/loading.reducer'
import { WindowOpener } from '@/utils/WindowOpener'

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}

export class WebsocketManager extends ExtendedEmitter {
  public ws = io('', { path: '/ws' })
  public meta?: MetaObject
  ping = -1

  constructor() {
    super()

    this.add(this.ws as any)
  }

  private log(msg: string) {
    Logger.log('WS', msg)
  }

  @Event('connect')
  onConnect() {
    this.log('Connected to socket')

    if (Api.guildId) void Api.getGuild(Api.guildId)
    store.dispatch(setLoading(false))
  }

  @Event('disconnect')
  onDisconnect() {
    this.log('Socket disconnected')

    store.dispatch(setLoading(true))
  }

  public async request<K extends keyof WebSocketEventMap>(
    event: K,
    data?: WebSocketEventMap[K]['receive']
  ): Promise<WebSocketEventMap[K]['send']> {
    return await new Promise((resolve, reject) => {
      if (stats.headless) {
        if (headlessHandlers[event])
          resolve(headlessHandlers[event]?.(data as any) as any)
      }

      this.ws.emit(event, data, (dat: any) => {
        if (dat?.error) {
          this.log('Got error ' + String(dat.error))
          reject(new Error(dat.error))
        } else resolve(dat)
      })
    })
  }

  public tell(event: string, data?: any) {
    this.ws.emit(event, data)
  }

  authWindow?: WindowOpener

  @Event('AUTHORIZE')
  async authorize(respond: (val: EventMap['AUTHORIZE']) => void) {
    if (Api.token) return respond({ token: Api.token })

    this.authWindow = Api.login().cancel(() => {
      respond({ cancel: true })
      this.authWindow?.close()
    })

    await this.authWindow.wait()
    if (Api.token) return respond({ token: Api.token })
    else if (this.authWindow.closedByUser) return respond({ cancel: true })
  }

  @Event('FAILED_AUTHORIZATION')
  async failedAuthorization() {
    this.authWindow?.close()
  }

  @Event('RELOAD')
  onReload() {
    location.reload()
  }

  @Event('HELLO')
  onHello(data: EventMap['HELLO']) {
    this.meta = data
  }

  @Event('CHANGE_SETTING')
  onGuildChange(data: EventMap['CHANGE_SETTING']) {
    const currentGuild = store.getState().guild.currentGuild
    if (!currentGuild || currentGuild.guild.id !== data.id) return

    store.dispatch(setDb(data.data))
  }

  @Event('UPDATE_USER')
  onUserUpdate(data: EventMap['UPDATE_USER']) {
    store.dispatch(setUser(data))
  }

  @Event('UPDATE_GUILD')
  onGuildUpdate(data: EventMap['UPDATE_GUILD']) {
    console.log('update guild')
    store.dispatch(setCurrentGuild(data))
  }

  @Event('DELETE_GUILD')
  onGuildDelete(guildId: EventMap['DELETE_GUILD']) {
    console.log('Retrieved delete guild ' + guildId)
    const currentGuild = store.getState().guild.currentGuild

    console.log({ currentGuild })

    if (!currentGuild || currentGuild.guild.id !== guildId) return

    store.dispatch(setCurrentGuild(undefined))
    store.dispatch(setNeedsInvite(true))

    const guilds = store.getState().user.guilds

    const newGuilds: ShortGuild[] = Object.assign([], guilds)
    const g: ShortGuild = Object.assign(
      {},
      newGuilds.find((x) => x.id === guildId)
    )

    if (g) {
      g.joined = false

      store.dispatch(
        setGuilds(newGuilds.filter((x) => x.id !== guildId).concat([g]))
      )
    }
  }

  @Event('UNCACHE')
  uncache() {
    Api.getGuilds()
      .then((guilds) => {
        store.dispatch(setGuilds(guilds))
        if (guilds && Api.guildId) {
          void Api.getGuild(Api.guildId)
            .then((guild) => {
              if (!guild || 'offlineInShard' in guild) return

              store.dispatch(setOfflineInShard(false))

              if ('notInGuild' in guild) {
                store.dispatch(setCurrentGuild(undefined))
                store.dispatch(setNeedsInvite(true))
              } else {
                store.dispatch(setCurrentGuild(guild))
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }
}
