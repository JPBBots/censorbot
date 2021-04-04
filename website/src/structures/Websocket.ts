import { CensorBotApi } from './Api'

import { Logger } from './Logger'

import { WebSocketEventMap } from '@typings/websocket'

export class CensorBotWs {
  private ws: WebSocket
  private promises: Map<number, (data: any) => void> = new Map()

  public sequence = 0

  private hbInterval: number

  constructor (private api: CensorBotApi) {}

  private log (msg: string) {
    Logger.log('WS', msg)
  }

  public start () {
    this.ws = new WebSocket('wss://staging.censor.bot/ws')

    this.ws.onmessage = (data) => {
      this._handleMessage(data.data)
    }

    this.ws.onclose = (ev) => {
      this.log(`Closed with code: ${ev.code} / ${ev.reason}`)
      this._handleClose()
    }
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
    this.sequence = 0

    if (this.hbInterval) clearInterval(this.hbInterval)
    this.promises.forEach(x => x({ closed: true }))

    this.promises.clear()

    this.start()
  }

  private _handleMessage (dat: string) {
    const data: {
      e: string
      d: any
      i: number
    } = JSON.parse(dat)

    if (data.e === 'RETURN') {
      const res = this.promises.get(data.i)
      if (res) res(data.d)
      return
    }

    if (data.e === 'HELLO') {
      this.api.handleOpen()
      this.log(`Received HELLO. Interval: ${data.d.interval / 1000}s`)
      this._heartbeat()

      this.hbInterval = setInterval(() => {
        void this._heartbeat()
      }, data.d.interval) as unknown as number
    }
  }

  private async _heartbeat () {
    const started = Date.now()

    await this.request('HEARTBEAT')

    this.log(`Heartbeat took ${Date.now() - started}ms`)
  }
}
