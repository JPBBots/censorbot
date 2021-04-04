import WebSocket from 'ws'
import { Socket } from './Socket'

import { APIUser } from 'discord-api-types'

import { Payload, WebSocketEventMap } from 'typings/websocket'

import { Events } from '../../helpers/wsEvents'
import { User } from 'typings/api'

export class Connection {
  public user?: APIUser
  public db?: User

  constructor (public socket: Socket, private readonly ws: WebSocket, public host: string) {
    ws.on('close', () => {
      this.socket.users.delete(this)
    })

    ws.on('message', (data) => {
      this._handleMessage((data as Buffer).toString('utf-8'))
    })

    this.send({
      e: 'HELLO',
      d: {
        interval: 30e3
      }
    })
  }

  get authorized (): boolean {
    return this.ws?.readyState === WebSocket.OPEN && !!this.db?.token
  }

  send (payload: Payload): void {
    this.ws.send(JSON.stringify(payload))
  }

  sendEvent <K extends keyof WebSocketEventMap>(event: K, data: WebSocketEventMap[K]['receive']): void {
    this.send({
      e: event,
      d: data
    })
  }

  private _handleMessage (str: string): void {
    const data: Payload = JSON.parse(str)

    void this._handleEvent(data.e, data.d, data.i)
  }

  private async _handleEvent (event: string, data?: any, id?: number): Promise<void> {
    let res
    if (typeof id === 'number') {
      res = this._respond(id)
    }

    try {
      await Events[event]?.(this, data, res)
        .catch(err => {
          res?.({ error: err.message ?? 'ERROR' })
        })
    } catch (err) {
      res?.({ error: err.message ?? 'ERROR' })
    }
  }

  private _respond (id: number) {
    return (data: any) => {
      this.send({
        e: 'RETURN',
        d: data,
        i: id
      })
    }
  }
}
