import { WebSocketEventMap } from 'typings/websocket'
import { Logger } from './Logger'

import headlessHandlers from './headlessHandler'
import { stats } from './StatsManager'

import { Event, ExtendedEmitter } from '@jpbberry/typed-emitter'
import { store } from 'store'
import { setCurrentGuild, setDb } from 'store/reducers/guilds.reducer'
import { setUser } from 'store/reducers/auth.reducer'

import { io } from 'socket.io-client'
import { Api } from './Api'
import { setLoading } from '@/store/reducers/loading.reducer'

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}

export class WebsocketManager extends ExtendedEmitter {
  public ws = io('', { path: '/ws' })
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
            if (!guild || 'notInGuild' in guild) return

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
          resolve(headlessHandlers[event]?.(data) as any)
      }

      this.ws.emit(event, data, (dat: any) => {
        if (dat?.error) {
          this.log('Got error ' + dat.error)
          if (dat.error === 'Unauthorized' && Api.token && !tryingLogin) {
            Api.getUser(true)
              .then(() => {
                return Api.getGuilds(true).then(() => {
                  return this.request(event, data).then((x) => resolve(x))
                })
              })
              .catch(() => {
                Api.logout(false)
                Api.login().then((user) => {
                  if (user)
                    Api.getGuilds(true).then(() => {
                      return this.request(event, data).then((x) => resolve(x))
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
}
