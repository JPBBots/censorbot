import { Incoming, MetaObject, WebSocketEventMap } from 'typings/websocket'
import { Utils } from 'utils/Utils'
import { Api } from './Api'
import { Logger } from './Logger'

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export class WebsocketManager {
  private ws?: WebSocket

  private readonly promises: Map<number, (data: any) => void> = new Map()
  private queue: Array<[string, any, number|undefined]> = []

  public sequence = 1
  public reconnecting = false

  public ping = 0
  public meta: Partial<MetaObject> = {
    connection: undefined,
    worker: undefined,
    region: undefined
  }

  private hbInterval?: number

  constructor (private readonly api: Api) {}

  get open () {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private log (msg: string) {
    Logger.log('WS', msg)
  }

  public start () {
    if (this.ws && this.open) this.ws.close()

    try {
      this.ws = new WebSocket(`wss://${location.host}/ws`)
    } catch (err) {
      Logger.error(err)
      return
    }

    this.ws.onmessage = (data) => {
      void this._handleMessage(data.data)
    }
    this.ws.onclose = (ev) => {
      this.log(`Closed with code: ${ev.code} / ${ev.reason}`)
      void this._handleClose()
    }
  }

  private send (event: string, data?: any, id?: number) {
    if (!this.open) return this.queue.push([event, data, id])

    this.ws?.send(JSON.stringify({
      e: event,
      d: data,
      i: id
    }))
  }

  public tell (event: string, data?: any) {
    this.send(event, data)
  }

  public async request <K extends keyof WebSocketEventMap> (event: K, data?: WebSocketEventMap[K]['receive']): Promise<WebSocketEventMap[K]['send']> {
    return await new Promise((resolve, reject) => {
      if (event !== 'HEARTBEAT') Logger.setLoading(true)
      const id = this.sequence++

      const timeout = setTimeout(() => {
        if (this.promises.has(id)) {
          reject(new Error('ERR_TOOK_TOO_LONG'))
          Logger.error('Error occured in request')

          this.promises.delete(id)
          Logger.setLoading(false)
        }
      }, 30e3)

      this.promises.set(id, (data) => {
        clearTimeout(timeout)

        if (data?.closed) {
          this.queue.push([event, data, id])
          return
        }

        this.promises.delete(id)
        if (data?.error) {
          Logger.error(data.error)

          return reject(data.error)
        }
        resolve(data)
        Logger.setLoading(false)
      })

      this.send(event, data, id)
    })
  }

  private async _handleMessage (dat: string) {
    const data: Incoming<'frontend'> = JSON.parse(dat)

    if (data.e === 'RETURN' && data.i) {
      const res = this.promises.get(data.i)
      if (res) res(data.d)
      return
    }

    if (data.e === 'RELOAD') return location.reload()

    if (data.e === 'HELLO') {
      this.log(
        'Received HELLO\n' +
        `Connected to ${data.d.$meta.region}/${data.d.$meta.worker}\n` +
        `ID: ${data.d.$meta.connection}\n` +
        `Interval: ${data.d.interval / 1000}s`
      )
      this.meta = data.d.$meta

      this.hbInterval = window?.setInterval(() => {
        void this._heartbeat()
      }, data.d.interval)
      void this._heartbeat()

      if (this.api.data.user) {
        await this.request('AUTHORIZE', { token: this.api.data.user.token, customer: false })
      }

      this.queue.forEach(q => {
        this.send(...q)
      })
      this.queue = []

      Logger.setLoading(false)

      this.api.handleOpen()
    }
  }

  async _handleClose () {
    Logger.setLoading(true)
    this.sequence = 1

    this.api.handleClose()

    if (this.hbInterval) clearInterval(this.hbInterval)
    this.promises.forEach(x => x({ closed: true }))

    this.promises.clear()

    await Utils.wait(5e3)

    this.start()
  }

  private async _heartbeat () {
    const started = Date.now()

    await this.request('HEARTBEAT')

    this.ping = Date.now() - started

    this.log(`Heartbeat took ${this.ping}ms`)
  }
}
