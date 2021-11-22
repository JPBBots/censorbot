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

    void Api.getUser().catch()
  }

  @Event('disconnect')
  onDisconnect() {
    this.log('Socket disconnected')
  }

  // private send (event: string, data?: any, id?: number) {
  //   if (!this.open) return this.queue.push([event, data, id])

  //   this.ws?.send(JSON.stringify({
  //     e: event,
  //     d: data,
  //     i: id
  //   }))
  // }

  // public tell (event: string, data?: any) {
  //   this.send(event, data)
  // }

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

      // const id = this.sequence++

      // const timeout = setTimeout(() => {
      //   if (this.promises.has(id)) {
      //     reject(new Error('ERR_TOOK_TOO_LONG'))
      //     Logger.error('Error occured in request')

      //     this.promises.delete(id)
      //     Logger.setLoading(false)
      //   }
      // }, 30e3)

      // this.promises.set(id, async (res) => {
      //   clearTimeout(timeout)

      //   if (res?.closed) {
      //     this.queue.push([event, data, id])
      //     return
      //   }

      //   if (res?.error) {
      //     this.log(`Error on ${event}: ${res.error}`)
      //     if (res.error === 'Unauthorized' && Api.token) {
      //       const res = await Api.getUser()
      //         .then(() => {
      //           this.send(event, data, id)

      //           return true
      //         })
      //         .catch(() => false)

      //       if (res) return this.log(`${event} recovered from unauthorized`)
      //     }

      //     Logger.error(res.error)

      //     reject(res.error)
      //   }
      //   this.promises.delete(id)

      //   if (!data?.error) resolve(res)
      //   Logger.setLoading(false)
      // })

      // this.send(event, data, id)
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

  // TODO
  // async _handleOpen () {
  //   const currentGuild = store.getState().guilds.currentGuild
  //   if (currentGuild) {
  //     const guild = await Api.getGuild(currentGuild.guild.i)

  //     if (guild) store.dispatch(setCurrentGuild(guild))
  //   }
  // }
}
