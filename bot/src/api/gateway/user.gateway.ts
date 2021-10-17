// import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { SelfData, Self } from '../decorators/self.decorator'
// import { GatewayAuthGuard } from '../guards/authorized.guard'

import { WebSocketEventMap } from 'typings/websocket'
import { UsersService } from '../services/users.service'
import { CacheService } from '../services/cache.service'
import { OAuthService } from '../services/oauth.service'
import { Snowflake } from 'discord-rose'
import { GuildsService } from '../services/guilds.service'
import { DatabaseService } from '../services/database.service'
import Pieces from '../../utils/Pieces'
import { ChargeBeeService } from '../services/chargebee.service'

export type SocketConnection = Socket & { data: SelfData }

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}

@WebSocketGateway({ path: '/ws', pingInterval: 45e3 })
export class UserGateway {
  @WebSocketServer()
  server: Server<{
    [key in keyof WebSocketEventMap]: (args: WebSocketEventMap[key]['receive']) => void
  }>

  constructor (
    private readonly users: UsersService,
    private readonly oauth: OAuthService,
    private readonly db: DatabaseService,
    private readonly caching: CacheService,
    private readonly guilds: GuildsService,
    private readonly chargebee: ChargeBeeService
  ) {
    guilds.on('GUILD_SETTINGS_UPDATE', (dat) => {
      this.server.to(dat.id).emit('CHANGE_SETTING', { id: dat.id, data: dat.db })
    })

    guilds.on('GUILD_UPDATED', (guild) => {
      this.server.to(guild.guild.i).emit('UPDATE_GUILD', guild)
    })

    users.on('USER_UPDATE', (user) => {
      this.server.to(user.id).emit('UPDATE_USER', user)
    })
  }

  getSelf (data: SelfData) {
    if (!data.userId) return undefined

    return this.caching.users.get(data.userId)
  }

  hasAccess (data: SelfData, id: Snowflake) {
    if (!data.userId) throw new Error('Unauthorized')

    const cache = this.caching.userGuilds.get(data.userId)

    if (!cache) throw new Error('Unauthorized')

    if (!cache.some(x => x.i === id)) throw new Error('Unauthorized')

    return true
  }

  @SubscribeMessage('LOGOUT')
  async logout (@Self() self: SelfData,
    @ConnectedSocket() sock: SocketConnection
  ) {
    if (self.userId) await sock.leave(self.userId)
    self.userId = undefined
  }

  @SubscribeMessage('AUTHORIZE')
  async authorize (
  @Self() self: SelfData,
    @ConnectedSocket() sock: SocketConnection,
    @MessageBody() data: EventMap['AUTHORIZE']
  ) {
    if (!data.token) throw new Error('Invalid Token')

    const user = await this.users.login(data.token)

    self.userId = user.id
    await sock.join(user.id)

    return {
      ...user,
      _id: undefined,
      bearer: undefined
    }
  }

  @SubscribeMessage('GET_GUILDS')
  async getGuilds (
  @Self() self: SelfData
  ) {
    const user = this.getSelf(self)
    if (!user?.bearer) throw new Error('Unauthorized')

    let guilds = this.caching.userGuilds.get(user.id)
    if (guilds) return guilds

    guilds = await this.oauth.getGuilds(user?.bearer)

    this.caching.userGuilds.set(user.id, guilds)

    return guilds
  }

  @SubscribeMessage('SUBSCRIBE')
  async subscribe (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['SUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    if (!data) return

    if (!this.hasAccess(self, data)) return

    if (self.subscribedGuild) await sock.leave(self.subscribedGuild)

    await sock.join(data)

    const guild = await this.guilds.get(data)

    self.subscribedGuild = guild.guild.i

    return guild
  }

  @SubscribeMessage('UNSUBSCRIBE')
  async unsubscribe (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['UNSUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    await sock.leave(data)
  }

  @SubscribeMessage('CHANGE_SETTING')
  async changeSetting (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['CHANGE_SETTING']
  ) {
    if (!data || !data.data || !data.id) return

    if (!this.hasAccess(self, data.id)) return { error: 'Unauthorized' }

    await this.guilds.set(data.id, Pieces.normalize(data.data))

    return true
  }

  @SubscribeMessage('SET_PREMIUM')
  async setPremium (
  @Self() self: SelfData,
    @MessageBody() data: EventMap['SET_PREMIUM']
  ) {
    const user = this.getSelf(self)

    if (!user || !user.premium || !data?.guilds) return

    if (data.guilds.length > user.premium.count) {
      return {
        error: 'Not enough premium servers.'
      }
    }

    if (!data.guilds.every(x => x.match(/^[0-9]{5,}$/))) return { error: 'Strange guild ID' }

    await this.db.collection('premium_users').updateOne({ id: user.id }, {
      $set: {
        id: user.id,
        guilds: data.guilds
      }
    }, {
      upsert: true
    })

    user.premium.guilds.filter(x => !data.guilds.includes(x)).forEach(guild => {
      const cur = this.caching.guilds.get(guild)
      if (!cur) return

      cur.premium = false // TODO
      this.caching.guilds.set(guild, cur)
    })
    data.guilds.forEach(guild => {
      const cur = this.caching.guilds.get(guild)
      if (!cur) return

      cur.premium = true
      this.caching.guilds.set(guild, cur)
    })

    user.premium.guilds = data.guilds

    return true
  }

  // TODO TICKETS
}
