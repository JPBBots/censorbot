import { EventEmitter } from '@jpbberry/typed-emitter'
import { Injectable } from '@nestjs/common'
import { Snowflake } from 'discord-api-types/v9'
import { User, UserPremium } from 'typings'

import { CacheService } from './cache.service'
import { ChargeBeeService } from './chargebee.service'
import { DatabaseService } from './database.service'
import { InterfaceService } from './interface.service'
import { OAuthService } from './oauth.service'

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
  }

  get db() {
    return this.database.collection('users')
  }

  async causeUpdate(id: Snowflake) {
    const cachedUser = this.caching.users.get(id)
    if (!cachedUser) return

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

  async extendUser(user: User): Promise<User> {
    user.admin = await this.int.api.isAdmin(user.id)

    const prem = await this.chargebee.getAmount(user.id)

    const premium: UserPremium = {
      count: 0,
      guilds: [],
      customer: prem.customer
    }
    if (prem.amount > 0) {
      premium.count = prem.amount

      let premiumUser = await this.database
        .collection('premium_users')
        .findOne({ id: user.id })
      if (!premiumUser) {
        premiumUser = {
          id: user.id,
          guilds: []
        }
        await this.database
          .collection('premium_users')
          .updateOne({ id: user.id }, { $set: premiumUser }, { upsert: true })
      }
      premium.guilds = premiumUser.guilds
    }

    user.premium = {
      ...premium,
      trial: !!(await this.database
        .collection('trials')
        .findOne({ user: user.id, disabled: false }))
    }

    return user
  }

  async getGuilds(user: User) {
    let guilds = this.caching.userGuilds.get(user.id)
    if (guilds) return guilds

    guilds = await this.oauth.getGuilds(user.bearer!)

    this.caching.userGuilds.set(user.id, guilds)

    return guilds
  }
}
