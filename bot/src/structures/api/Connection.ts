import WebSocket from 'ws'
import { Socket } from './Socket'

import { Snowflake } from 'discord-api-types'

import { Payload, WebSocketEventMap } from 'typings/websocket'

import { Events } from '../../helpers/wsEvents'
import { GuildData, ShortGuild, User } from 'typings/api'

export class Connection {
  id = `${this.socket.manager.region}_${Math.floor(Math.random() * 10000000 + Date.now()) + 1 + Date.now()}`
  userId?: Snowflake

  public subscribed?: Snowflake

  constructor (public socket: Socket, private readonly ws: WebSocket, public host: string) {
    ws.on('close', () => {
      this.socket.handleClose(this)
    })

    ws.on('message', (data) => {
      this._handleMessage((data as Buffer).toString('utf-8'))
    })

    this.sendEvent('HELLO', {
      interval: 30e3,
      $meta: {
        worker: socket.manager.id,
        connection: this.id,
        region: socket.manager.region
      }
    })
  }

  get db (): User | undefined {
    if (!this.userId) return undefined
    return this.socket.cachedUsers.get(this.userId)
  }

  get guilds (): null|ShortGuild[] {
    if (!this.authorized || !this.db) throw new Error('Unauthorized')

    const cached = this.socket.cachedShortGuilds.get(this.db.id)
    if (cached) return cached

    return null
  }

  get authorized (): boolean {
    return this.ws?.readyState === WebSocket.OPEN && !!this.db?.token
  }

  async access (guildId: Snowflake): Promise<boolean> {
    return (await this.getGuilds()).some(x => x.i === guildId) || !!this.db?.admin
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
    } catch (err) {
      res?.({ error: err.message ?? 'ERROR' })
    }
  }

  public async getGuilds (): Promise<ShortGuild[]> {
    if (!this.authorized || !this.db?.bearer) throw new Error('Unauthorized')

    if (this.guilds) return this.guilds

    const guilds = await this.socket.manager.oauth.getGuilds(this.db.bearer)

    if (!guilds) throw new Error('Invalid token')

    if (this.db) this.socket.cachedShortGuilds.set(this.db.id, guilds)

    return guilds
  }

  public async getGuild (id: Snowflake): Promise<GuildData> {
    if (!this.authorized) throw new Error('Unauthorized')

    if (!await this.access(id)) throw new Error('No access to guild')

    return await this.socket.guilds.get(id)
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
