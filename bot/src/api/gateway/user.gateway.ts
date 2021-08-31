// import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { SelfData, Self } from '../decorators/self.decorator'
// import { GatewayAuthGuard } from '../guards/authorized.guard'

import { WebSocketEventMap } from 'typings/websocket'
import { UsersService } from '../services/users.service'
import { CacheService } from '../services/cache.service'

export type SocketConnection = Socket & { data: SelfData }

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}

@WebSocketGateway({ path: '/ws', pingInterval: 45e3 })
export class UserGateway {
  @WebSocketServer()
  server: Server

  constructor (
    private readonly users: UsersService,
    private readonly caching: CacheService
  ) {
    setInterval(() => {
      this.server.to('a').emit('HELLO', 'abc 123')
    }, 5e3)
  }

  getSelf (data: SelfData) {
    if (!data.userId) return undefined

    return this.caching.users.get(data.userId)
  }

  @SubscribeMessage('LOGOUT')
  logout (@Self() self: SelfData) {
    self.userId = undefined
  }

  @SubscribeMessage('AUTHORIZE')
  async authorize (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['AUTHORIZE']
  ) {
    if (!data.token) throw new Error('Invalid Token')

    const user = await this.users.login(data.token)

    self.userId = user.id

    return {
      ...user,
      _id: undefined,
      bearer: undefined
    }
  }

  @SubscribeMessage('SUBSCRIBE')
  async subscribe (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['SUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    await sock.join('a')
  }

  @SubscribeMessage('UNSUBSCRIBE')
  async unsubscribe (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['UNSUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    await sock.leave('a')
  }
}
