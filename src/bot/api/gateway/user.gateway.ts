// import { UseGuards } from '@nestjs/common'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { Snowflake, State } from 'jadl'

import { ShortGuild, User, WebSocketEventMap } from '@censorbot/typings'
import { UsersService } from '../services/users.service'
import { CacheService } from '../services/cache.service'
import { GuildsService } from '../services/guilds.service'
import { DatabaseService } from '../services/database.service'
import { ChargeBeeService } from '../services/chargebee.service'

import Pieces from '../../utils/Pieces'
import { StatusService } from '../services/status.service'
import { TicketsService } from '../services/tickets.service'
import { UseInterceptors } from '@nestjs/common'
import {
  UserInterceptor,
  Self,
  SelfData,
  SelfDat,
  AdminInterceptor,
  Guilds,
  GuildsInterceptor
} from './utils'
import { JoiValidationPipe } from './joi.pipe'
import Joi, { ValidationError } from 'joi'
import { Config } from 'bot/config'

type EventMap = {
  [key in keyof WebSocketEventMap]: WebSocketEventMap[key]['receive']
}
export type SocketConnection = Socket<
  {
    [key in keyof EventMap]: (val: EventMap[key]) => void
  },
  {
    [key in keyof EventMap]:
      | ((val: EventMap[key]) => void)
      | ((cb: (val: EventMap[key]) => void) => void)
  }
> & { data: SelfData }

const sfRegex = /^[0-9]{5,50}$/
const SnowflakeString = Joi.string()
  .regex(sfRegex)
  .error((errs) => {
    return new ValidationError('Not a Snowflake', errs[0], errs[0])
  })

const JVP = (j: Joi.Schema) => new JoiValidationPipe(j)

@WebSocketGateway({ path: '/ws', pingInterval: 45e3 })
export class UserGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server<{
    [key in keyof WebSocketEventMap]: (
      args: WebSocketEventMap[key]['receive']
    ) => void
  }>

  constructor(
    private readonly users: UsersService,
    private readonly db: DatabaseService,
    private readonly caching: CacheService,
    private readonly guilds: GuildsService,
    private readonly chargebee: ChargeBeeService,
    private readonly status: StatusService,
    private readonly tickets: TicketsService
  ) {
    guilds.on('GUILD_SETTINGS_UPDATE', (dat) => {
      this.server
        .to(dat.id)
        .emit('CHANGE_SETTING', { id: dat.id, data: dat.db })
    })

    guilds.on('GUILD_UPDATED', (guild) => {
      this.server.to(guild.guild.id).emit('UPDATE_GUILD', guild)
    })
    guilds.on('GUILD_DELETED', (guildId) => {
      this.server.to(guildId).emit('DELETE_GUILD', guildId)
    })

    users.on('USER_UPDATE', (user) => {
      this.server.to(user.id).emit('UPDATE_USER', {
        ...user,
        _id: undefined,
        bearer: undefined
      })
    })

    status.on('CLEAR_CACHE', () => {
      this.server.emit('UNCACHE', null)
    })
  }

  hasAccess(user: User, id: Snowflake) {
    if (!user?.id) return false

    if (user.admin) return true

    const cache = this.caching.userGuilds.get(user.id)

    if (!cache) return false

    if (!cache.some((x) => x.id === id)) return false

    return true
  }

  async handleConnection(client: SocketConnection) {
    client.emit('HELLO', {
      connection: client.id,
      region: 'na',
      worker: 1
    })
  }

  @SubscribeMessage('LOGOUT')
  async logout(@ConnectedSocket() sock: SocketConnection) {
    if (sock.data.userId) await sock.leave(sock.data.userId)
    sock.data.userId = undefined
  }

  @SubscribeMessage('GET_USER')
  @UseInterceptors(UserInterceptor)
  async getUser(@Self() user: User) {
    return {
      ...user,
      _id: undefined,
      bearer: undefined
    }
  }

  @SubscribeMessage('GET_GUILDS')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async getGuilds(@Guilds() guilds: ShortGuild[]) {
    return guilds
  }

  @SubscribeMessage('SUBSCRIBE')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async subscribe(
    @Self() user: User,
    @SelfDat() selfData: SelfData,
    @MessageBody(JVP(SnowflakeString.required()))
    data: EventMap['SUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    if (!this.hasAccess(user, data)) return { error: 'Unauthorized' }

    if (selfData.subscribedGuild) await sock.leave(selfData.subscribedGuild)

    await sock.join(data)

    const shard = await this.status.getShardForGuild(data)

    if (shard && shard.state !== State.CONNECTED)
      return { error: 'Offline in Shard' }

    const guild = await this.guilds
      .get(data)
      .catch((err) => ({ error: err.message }))
    if ('error' in guild) return guild

    selfData.subscribedGuild = guild.guild.id

    return guild
  }

  @SubscribeMessage('UNSUBSCRIBE')
  @UseInterceptors(UserInterceptor)
  async unsubscribe(
    @MessageBody(JVP(SnowflakeString.required())) data: EventMap['UNSUBSCRIBE'],
    @ConnectedSocket() sock: SocketConnection
  ) {
    await sock.leave(data)
  }

  @SubscribeMessage('CHANGE_SETTING')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async changeSetting(
    @Self() user: User,
    @MessageBody() data: EventMap['CHANGE_SETTING']
  ) {
    if (!data || !data.data || !data.id) return

    if (!this.hasAccess(user, data.id)) return { error: 'Unauthorized' }

    const err = await this.guilds.set(data.id, Pieces.normalize(data.data))
    if ('error' in (err || {})) return err

    return true
  }

  @SubscribeMessage('SET_PREMIUM')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async setPremium(
    @Self() user: User,
    @MessageBody(
      JVP(
        Joi.object({
          guilds: Joi.array()
            .items(SnowflakeString.required().optional())
            .required()
        }).required()
      )
    )
    data: EventMap['SET_PREMIUM']
  ) {
    if (!user.premium) return

    if (data.guilds.length > user.premium.count) {
      return {
        error: 'Not enough premium servers.'
      }
    }

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
      .forEach((guild) => {
        const cur = this.caching.guilds.get(guild)
        if (!cur) return

        void this.db.removeGuildPremium(guild).then(() => {
          void this.guilds.updateGuild(guild)
        })
      })

    data.guilds.forEach((guild) => {
      void this.guilds.updateGuild(guild)
    })

    user.premium.guilds = data.guilds
    this.users.emit('USER_UPDATE', user)

    return true
  }

  @SubscribeMessage('ENABLE_TRIAL')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async enableTrial(
    @Self() user: User,
    @MessageBody(JVP(SnowflakeString.required()))
    guildId: EventMap['ENABLE_TRIAL']
  ) {
    if (!this.hasAccess(user, guildId)) return { error: 'Unauthorized' }
    if (user.premium?.count) return { error: 'User already has premium' }

    const activeTrial = await this.db
      .collection('trials')
      .findOne({ user: user.id, disabled: false })

    if (activeTrial) return { error: 'User already has a trial active' }

    const guildPremium = await this.db.guildPremium(guildId)

    if (guildPremium.premium) return { error: 'Guild already has premium' }
    if (guildPremium.trial) return { error: 'Guild has already used its trial' }

    await this.db.collection('trials').insertOne({
      guild: guildId,
      user: user.id,
      disabled: false,
      until: Date.now() + Config.trialLength
    })

    await this.guilds.updateGuild(guildId)

    return true
  }

  @SubscribeMessage('CANCEL_TRIAL')
  @UseInterceptors(UserInterceptor, GuildsInterceptor)
  async cancelTrial(
    @Self() user: User,
    @MessageBody(JVP(SnowflakeString.required()))
    guildId: EventMap['CANCEL_TRIAL']
  ) {
    if (!this.hasAccess(user, guildId)) return { error: 'Unauthorized' }

    const trial = await this.db.collection('trials').findOne({ guild: guildId })

    if (!trial) return { error: 'Guild does not have a trial' }
    if (trial.disabled) return { error: 'Guilds trial is already over' }

    await this.db
      .collection('trials')
      .updateOne({ guild: guildId }, { $set: { disabled: true } })

    await this.db.removeGuildPremium(guildId)

    void this.guilds.updateGuild(trial.guild)
    if (trial.user) void this.users.causeUpdate(trial.user)

    return true
  }

  @SubscribeMessage('CREATE_PORTAL_SESSION')
  @UseInterceptors(UserInterceptor)
  async createPortalSession(@Self() user: User) {
    const id = await this.chargebee.getCustomerId(user.id)
    if (!id) return { error: 'Invalid Customer for Portal' }

    try {
      const portalPage = await this.chargebee.chargebee.portal_session
        .create({
          customer: { id }
        })
        .request()

      return portalPage.portal_session
    } catch (_err) {
      return {
        error: 'Invalid Customer for Portal'
      }
    }
  }

  @SubscribeMessage('CREATE_HOSTED_PAGE')
  @UseInterceptors(UserInterceptor)
  async createHostedPage(
    @Self() user: User,
    @MessageBody(
      JVP(
        Joi.object({
          plan: Joi.string()
        }).required()
      )
    )
    data: EventMap['CREATE_HOSTED_PAGE']
  ) {
    const customerId = await this.chargebee.getCustomerId(user.id)

    const hostedPage = await this.chargebee.chargebee.hosted_page
      .checkout_new({
        subscription: {
          plan_id: data.plan
        },
        customer: customerId
          ? {
              id: customerId
            }
          : {
              first_name: 'Discord',
              last_name: `${user.tag}`,
              id: (await this.chargebee.getCustomerId(user.id)) ?? user.id,
              email: user.email ?? undefined
            }
      })
      .request((error) => {
        if (error) console.log(error)
      })

    return hostedPage.hosted_page
  }

  // TODO: TICKETS

  @SubscribeMessage('GET_TICKETS')
  @UseInterceptors(UserInterceptor, AdminInterceptor)
  async getTickets() {
    return await this.tickets.getTickets()
  }

  @SubscribeMessage('TEST_TICKET')
  @UseInterceptors(UserInterceptor, AdminInterceptor)
  async testTicket(@MessageBody() ticket: EventMap['TEST_TICKET']) {
    return await this.tickets.testTicket(ticket.id, ticket.bypasses)
  }

  @SubscribeMessage('ACCEPT_TICKET')
  @UseInterceptors(UserInterceptor, AdminInterceptor)
  async acceptTicket(@MessageBody() ticket: EventMap['ACCEPT_TICKET']) {
    const filter = await this.tickets.createNewFilter()
    this.tickets.addBypasses(filter, ticket.bypasses)

    await this.tickets.exportFilterToDatabase(filter)

    await this.tickets.accept(ticket.id)

    return { success: true }
  }

  @SubscribeMessage('DENY_TICKET')
  @UseInterceptors(UserInterceptor, AdminInterceptor)
  async denyTicket(@MessageBody() ticket: EventMap['DENY_TICKET']) {
    await this.tickets.deny(ticket.id)

    return { success: true }
  }

  @SubscribeMessage('TEST')
  @UseInterceptors(UserInterceptor, AdminInterceptor)
  async test(@Self() s: User) {
    console.log('actual self', s)

    return 'b'
  }
}
