import { MetaObject, WebSocketEventMap } from '@jpbbots/cb-typings'
import { Logger } from './Logger'

import headlessHandlers from './headlessHandler'
import { stats } from './StatsManager'

import { Event, ExtendedEmitter } from '@jpbberry/typed-emitter'
import { store } from 'store'
import {
  setCurrentGuild,
  setDb,
  setGuilds,
  setNeedsInvite,
  setOfflineInShard
} from 'store/reducers/guilds.reducer'
import { setUser } from 'store/reducers/auth.reducer'

import { io } from 'socket.io-client'
import { Api } from './Api'
import { setLoading } from '@/store/reducers/loading.reducer'
import { setServerCount } from '@/store/reducers/meta.reducer'

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

    store.dispatch(setLoading(false))

    void Api.getUser().then((user) => {
      if (user && Api.guildId)
        void Api.getGuild(Api.guildId)
          .then((guild) => {
            if (!guild || 'notInGuild' in guild || 'offlineInShard' in guild)
              return

            store.dispatch(setCurrentGuild(guild))
          })
          .catch()
    })
  }

  @Event('disconnect')
  onDisconnect() {
    this.log('Socket disconnected')

    store.dispatch(setLoading(true))
  }

  public async request<K extends keyof WebSocketEventMap>(
    event: K,
    data?: WebSocketEventMap[K]['receive'],
    tryingLogin = false
  ): Promise<WebSocketEventMap[K]['send']> {
    return await new Promise((resolve, reject) => {
      if (stats.headless) {
        if (headlessHandlers[event])
          resolve(headlessHandlers[event]?.(data as any) as any)
      }

      this.ws.emit(event, data, (dat: any) => {
        if (dat?.error) {
          this.log('Got error ' + String(dat.error))
          if (dat.error === 'Unauthorized' && Api.token && !tryingLogin) {
            Api.getUser(true)
              .then(async () => {
                return await Api.getGuilds(true).then(async () => {
                  return await this.request(event, data).then((x) => resolve(x))
                })
              })
              .catch(() => {
                Api.logout(false)
                void Api.login().then((user) => {
                  if (user)
                    void Api.getGuilds(true).then(async () => {
                      return await this.request(event, data)
                        .then((x) => resolve(x))
                        .catch((err) => reject(err))
                    })
                })
              })
          } else {
            reject(new Error(dat.error))
          }
        } else resolve(dat)
      })
    })
  }

  public tell(event: string, data?: any) {
    this.ws.emit(event, data)
  }

  @Event('RELOAD')
  onReload() {
    location.reload()
  }

  @Event('HELLO')
  onHello(data: EventMap['HELLO']) {
    this.meta = data

    store.dispatch(setServerCount(data.serverCount))
  }

  @Event('CHANGE_SETTING')
  onGuildChange(data: EventMap['CHANGE_SETTING']) {
    const currentGuild = store.getState().guilds.currentGuild
    if (!currentGuild || currentGuild.guild.id !== data.id) return

    store.dispatch(setDb(data.data))
  }

  @Event('UPDATE_USER')
  onUserUpdate(data: EventMap['UPDATE_USER']) {
    store.dispatch(setUser(data))
  }

  @Event('UPDATE_GUILD')
  onGuildUpdate(data: EventMap['UPDATE_GUILD']) {
    store.dispatch(setCurrentGuild(data))
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
            .catch()
        }
      })
      .catch(() => {})
  }
}
