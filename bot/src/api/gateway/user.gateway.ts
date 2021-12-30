// import { UseGuards } from '@nestjs/common'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { SelfData, Self } from '../decorators/self.decorator'
// import { GatewayAuthGuard } from '../guards/authorized.guard'

import { Snowflake } from 'jadl'

import { WebSocketEventMap } from 'typings/websocket'
import { UsersService } from '../services/users.service'
import { CacheService } from '../services/cache.service'
import { OAuthService } from '../services/oauth.service'
import { GuildsService } from '../services/guilds.service'
import { DatabaseService } from '../services/database.service'
import { ChargeBeeService } from '../services/chargebee.service'

import Pieces from '../../utils/Pieces'
import { ThreadService } from '../services/thread.service'

export type SocketConnection = Socket & { data: SelfData }

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}

@WebSocketGateway({ path: '/ws', pingInterval: 45e3 })
export class UserGateway {
  @WebSocketServer()
  server: Server<{
    [key in keyof WebSocketEventMap]: (
      args: WebSocketEventMap[key]['receive']
    ) => void
  }>

  constructor(
    private readonly users: UsersService,
    private readonly oauth: OAuthService,
    private readonly db: DatabaseService,
    private readonly caching: CacheService,
    private readonly guilds: GuildsService,
    private readonly chargebee: ChargeBeeService,
    private readonly thread: ThreadService
  ) {
    guilds.on('GUILD_SETTINGS_UPDATE', (dat) => {
      this.server
        .to(dat.id)
        .emit('CHANGE_SETTING', { id: dat.id, data: dat.db })
    })

    guilds.on('GUILD_UPDATED', (guild) => {
      this.server.to(guild.guild.id).emit('UPDATE_GUILD', guild)
    })

    users.on('USER_UPDATE', (user) => {
      this.server.to(user.id).emit('UPDATE_USER', {
        ...user,
        _id: undefined,
        bearer: undefined
      })
    })
  }

  getSelf(data: SelfData) {
    if (!data.userId) return undefined

    return this.caching.users.get(data.userId)
  }

  hasAccess(data: SelfData, id: Snowflake) {
    if (!data.userId) return false

    const cache = this.caching.userGuilds.get(data.userId)

    if (!cache) return false

    if (!cache.some((x) => x.id === id)) return false

    return true
  }

  @SubscribeMessage('RELOAD_SELF')
  reloadSelf(@Self() self: SelfData) {
    if (self.userId) this.users.causeUpdate(self.userId)
  }

  @SubscribeMessage('LOGOUT')
  async logout(
    @Self() self: SelfData,
    @ConnectedSocket() sock: SocketConnection
  ) {
    if (self.userId) await sock.leave(self.userId)
    self.userId = undefined
  }

  @SubscribeMessage('AUTHORIZE')
  async authorize(
    @Self() self: SelfData,
    @ConnectedSocket() sock: SocketConnection,
    @MessageBody() data: EventMap['AUTHORIZE']
  ) {
    if (!data.token) return { error: 'Invalid Token' }

    const user = await this.users.login(data.token).catch((err: Error) => err)

    if (user instanceof Error) return { error: user.message }

    self.userId = user.id
    await sock.join(user.id)

    return {
      ...user,
      _id: undefined,
      bearer: undefined
    }
  }

  @SubscribeMessage('GET_GUILDS')
  async getGuilds(@Self() self: SelfData) {
    const user = this.getSelf(self)
    if (!user?.bearer) throw new Error('Unauthorized')

    let guilds = this.caching.userGuilds.get(user.id)
    if (guilds) return guilds
    try {
      guilds = await this.oauth.getGuilds(user?.bearer)
    } catch (err) {
      return { error: 'Unauthorized' }
    }

    this.thread
      .sendCommand(
        'IN_GUILDS',
        guilds.map((x) => x.id)
      )
      .then(console.debug)

    this.caching.userGuilds.set(user.id, guilds)

    return guilds
  }

  @SubscribeMessage('SUBSCRIBE')
  async subscribe(
    @Self() self: SelfData,
    @MessageBody() data: EventMap['SUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    if (!data) return

    if (!this.hasAccess(self, data)) return { error: 'Unauthorized' }

    if (self.subscribedGuild) await sock.leave(self.subscribedGuild)

    await sock.join(data)

    const guild = await this.guilds
      .get(data)
      .catch((err) => ({ error: err.message }))
    if ('error' in guild) return guild

    self.subscribedGuild = guild.guild.id

    return guild
  }

  @SubscribeMessage('UNSUBSCRIBE')
  async unsubscribe(
    @Self() self: SelfData,
    @MessageBody() data: EventMap['UNSUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    await sock.leave(data)
  }

  @SubscribeMessage('CHANGE_SETTING')
  async changeSetting(
    @Self() self: SelfData,
    @MessageBody() data: EventMap['CHANGE_SETTING']
  ) {
    if (!data || !data.data || !data.id) return

    if (!this.hasAccess(self, data.id)) return { error: 'Unauthorized' }

    const err = await this.guilds.set(data.id, Pieces.normalize(data.data))
    if ('error' in (err || {})) return err

    return true
  }

  @SubscribeMessage('SET_PREMIUM')
  async setPremium(
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

    if (!data.guilds.every((x) => x.match(/^[0-9]{5,}$/)))
      return { error: 'Strange guild ID' }

    await this.db.collection('premium_users').updateOne(
      { id: user.id },
      {
        $set: {
          id: user.id,
          guilds: data.guilds
        }
      },
      {
        upsert: true
      }
    )

    user.premium.guilds
      .filter((x) => !data.guilds.includes(x))
      .forEach(async (guild) => {
        const cur = this.caching.guilds.get(guild)
        if (!cur) return

        await this.db.removeGuildPremium(guild)

        this.guilds.updateGuild(guild)
      })

    data.guilds.forEach((guild) => {
      this.guilds.updateGuild(guild)
    })

    user.premium.guilds = data.guilds
    this.users.emit('USER_UPDATE', user)

    return true
  }

  @SubscribeMessage('CREATE_PORTAL_SESSION')
  async createPortalSession(@Self() self: SelfData) {
    const user = this.getSelf(self)
    if (!user) return { error: 'Login' }
    if (!user.email) return { error: 'Needs email' }

    const customer = await this.chargebee.db.findOne({ id: user.id })
    if (!customer) return { error: 'Invalid Customer' }

    const portalPage = await this.chargebee.chargebee.portal_session
      .create({
        customer: {
          id: customer.customer
        }
      })
      .request((error) => {
        console.error(error)
        if (error) throw new Error(error)
      })

    return portalPage.portal_session
  }

  @SubscribeMessage('CREATE_HOSTED_PAGE')
  async createHostedPage(
    @Self() self: SelfData,
    @MessageBody() data: EventMap['CREATE_HOSTED_PAGE']
  ) {
    const user = this.getSelf(self)
    if (!user) return { error: 'Login' }
    if (!user.email) return { error: 'Needs email' }

    const hostedPage = await this.chargebee.chargebee.hosted_page
      .checkout_new({
        subscription: {
          plan_id: data.plan
        },
        customer: {
          first_name: 'Discord',
          last_name: `${user.tag}`,
          email: user.email
        }
      })
      .request((error) => {
        if (error) throw new Error(error)
      })

    return hostedPage.hosted_page
  }

  // TODO TICKETS
}
