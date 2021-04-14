import { CensorBotApi } from './Api'

import { Logger } from './Logger'

import { WebSocketEventMap } from '@typings/websocket'
import { GuildSettings } from '../pages/GuildSettings'
import { Utils } from './Utils'

let firstConnect = false

export class CensorBotWs {
  private ws: WebSocket
  private promises: Map<number, (data: any) => void> = new Map()

  public sequence = 0

  private hbInterval: number

  public reconnecting = false

  private waitingForReady: (() => void)[] = []

  constructor (private api: CensorBotApi) {}

  private log (msg: string) {
    Logger.log('WS', msg)
  }

  public start () {
    this.ws = new WebSocket(`wss://${location.host}/ws`)

    Logger.connectionStatus(false)

    this.ws.onmessage = (data) => {
      this._handleMessage(data.data)
    }

    this.ws.onclose = (ev) => {
      this.log(`Closed with code: ${ev.code} / ${ev.reason}`)
      this._handleClose()
    }
  }

  waitForConnection (): Promise<void> {
    return new Promise(resolve => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve()

      this.waitingForReady.push(resolve)
    })
  }
  
  tell (event: string, data?: any) {
    this.send(event, data)
  }

  public send (event: string, data?: any, id?: number) {
    this.ws.send(JSON.stringify({
      e: event,
      d: data,
      i: id
    }))
  }

  public request <K extends keyof WebSocketEventMap> (event: K, data?: WebSocketEventMap[K]['receive']): Promise<WebSocketEventMap[K]['send']> {
    return new Promise((resolve, reject) => {
      const id = this.sequence++

      const timeout = setTimeout(() => {
        if (this.promises.has(id)) {
          reject(new Error('ERR_TOOK_TOO_LONG'))
          Logger.tell('Error occured in request')

          this.promises.delete(id)
        }
      }, 30e3)

      this.promises.set(id, (data) => {
        clearTimeout(timeout)
        this.promises.delete(id)

        if (data && data.closed) return reject('ABORTED')
        if (data && data.error) return reject(data.error)
        resolve(data)
      })

      this.send(event, data, id)
    })
  }

  _handleClose () {
    Logger.connectionStatus(false)
    this.sequence = 0

    this.api.user = null
    this.api.guilds = null

    if (this.hbInterval) clearInterval(this.hbInterval)
    this.promises.forEach(x => x({ closed: true }))

    this.promises.clear()

    this.start()
  }

  private async _handleMessage (dat: string) {
    const data: {
      e: string
      d: any
      i: number
    } = JSON.parse(dat)

    if (window.dev) {
      this.log(`${data.e}: ${JSON.stringify(data.d, null, 2)} / ${data.i}`)
    }

    if (data.e === 'RETURN') {
      const res = this.promises.get(data.i)
      if (res) res(data.d)
      return
    }

    if (data.e === 'RELOAD') return location.reload()

    if (data.e === 'HELLO') {
      if (firstConnect) {
        Utils.reloadPage()
        firstConnect = false
      }

      if (this.waitingForReady) this.waitingForReady.forEach(x => x())
      this.waitingForReady = null

      Logger.connectionStatus(true)

      this.api.handleOpen()
      this.log(`Received HELLO. Interval: ${data.d.interval / 1000}s`)
      this._heartbeat()

      this.hbInterval = setInterval(() => {
        void this._heartbeat()
      }, data.d.interval) as unknown as number
    }

    if (this.api.loader.currentPage instanceof GuildSettings) {
      if (data.e === 'CHANGE_SETTING') {
        this.api.loader.currentPage.intakeUpdate(data.d)
      }
    }
  }

  private async _heartbeat () {
    const started = Date.now()

    await this.request('HEARTBEAT')

    this.log(`Heartbeat took ${Date.now() - started}ms`)
  }
}
