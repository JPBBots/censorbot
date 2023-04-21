import { EventEmitter } from '@jpbberry/typed-emitter'
import { Injectable } from '@nestjs/common'
import { Snowflake } from 'discord-api-types/v9'
import {
  User,
  UserPremium,
  PremiumUserSchema,
  SensitiveUser
} from '@censorbot/typings'

import { CacheService } from './cache.service'
import { ChargeBeeService } from './chargebee.service'
import { DatabaseService } from './database.service'
import { InterfaceService } from './interface.service'
import { OAuthService } from './oauth.service'
import { WithoutId } from 'mongodb'

@Injectable()
export class UsersService extends EventEmitter<{
  USER_UPDATE: User
}> {
  constructor(
    private readonly database: DatabaseService,
    private readonly int: InterfaceService,
    private readonly caching: CacheService,
    private readonly chargebee: ChargeBeeService,
    private readonly oauth: OAuthService
  ) {
    super()

    this.chargebee.on('USER_UPDATE', (id) => this.causeUpdate(id))
    this.oauth.on('USER_UPDATE', (id) => this.causeUpdate(id))
  }

  get db() {
    return this.database.collection('users')
  }

  async causeUpdate(id: Snowflake) {
    let cachedUser: User | SensitiveUser | undefined =
      this.caching.users.get(id)

    const dbUser = await this.db.findOne({ id })
    if (!dbUser) return

    if (!cachedUser) cachedUser = dbUser
    else {
      cachedUser.email = dbUser.email
      cachedUser.tag = dbUser.tag
      cachedUser.bearer = dbUser.bearer
      cachedUser.avatar = dbUser.avatar
    }

    const newUser = await this.extendUser(cachedUser)

    this.caching.users.set(id, newUser)

    this.emit('USER_UPDATE', newUser)
  }

  async login(token: string) {
    const user = await this.db.findOne({ token })
    if (!user) throw new Error('Invalid Token')

    const extendedUser = await this.extendUser(user)

    this.caching.users.set(extendedUser.id, extendedUser)

    return extendedUser
  }

  async getUserPremium(userId: string): Promise<User['premium']> {
    const prem = await this.chargebee.getAmount(userId)

    const premium: UserPremium = {
      count: 0,
      guilds: [],
      customer: prem.customer
    }
    if (prem.amount > 0) {
      premium.count = prem.amount

      let premiumUser: WithoutId<PremiumUserSchema> | null = await this.database
        .collection('premium_users')
        .findOne({ id: userId })

      if (!premiumUser) {
        premiumUser = {
          id: userId,
          guilds: []
        }
        await this.database
          .collection('premium_users')
          .updateOne({ id: userId }, { $set: premiumUser }, { upsert: true })
      }
      premium.guilds = premiumUser.guilds
    }

    return {
      ...premium,
      trial: !!(await this.database
        .collection('trials')
        .findOne({ user: userId, disabled: false }))
    }
  }

  async extendUser(shortUser: SensitiveUser): Promise<User> {
    return {
      ...shortUser,
      admin: await this.int.api.isAdmin(shortUser.id),
      premium: await this.getUserPremium(shortUser.id)
    }
  }

  async getGuilds(user: User) {
    let guilds = this.caching.userGuilds.get(user.id)
    if (guilds) return guilds

    guilds = await this.oauth.getGuilds(user.bearer!)

    this.caching.userGuilds.set(user.id, guilds)

    return guilds
  }
}
