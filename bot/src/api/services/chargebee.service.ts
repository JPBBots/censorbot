import { Injectable } from '@nestjs/common'

import * as chargebeeC from 'chargebee'

import Chargebee from 'chargebee-typescript'
import { Subscription } from 'chargebee-typescript/lib/resources'

import { Collection } from 'mongodb'
import { Snowflake } from 'discord-api-types'

import { PremiumTypes, RegisterResponse, User } from 'typings'
import { Cache } from '@jpbberry/cache'

import { Config } from '../../config'

import { DatabaseService } from './database.service'
import { InterfaceService } from './interface.service'
import { CacheService } from './cache.service'

const chargebee = chargebeeC as Chargebee.ChargeBee

interface CustomerSchema {
  /**
   * Discord User ID
   */
  id: Snowflake
  /**
   * Customer ChargeBee ID
   */
  customer: string
}

export interface AmountObject {
  amount: number
  customer: boolean
}

const NONE: AmountObject = {
  amount: 0,
  customer: false
}

@Injectable()
export class ChargeBeeService {
  chargebee: Chargebee.ChargeBee = chargebee

  cache: Cache<Snowflake, AmountObject> = new Cache(
    Config.dashboardOptions.wipeTimeout
  )

  constructor(
    private readonly database: DatabaseService,
    private readonly int: InterfaceService,
    private readonly caching: CacheService
  ) {
    this.chargebee.configure({
      site: `censorbot${Config.staging ? '-test' : ''}`,
      api_key: Config.chargebee.key
    })
  }

  get db(): Collection<CustomerSchema> {
    return this.database.collection('customers')
  }

  async getCustomerSub(customer: string): Promise<Subscription> {
    return await new Promise((resolve, reject) => {
      void this.chargebee.subscription
        .subscriptions_for_customer(customer)
        .request(
          (err, data: { list: Array<{ subscription: Subscription }> }) => {
            if (err) {
              if (err.error_code === 'resource_not_found') {
                return reject(new Error("Couldn't find subscription"))
              }
              return reject(new Error(err.message))
            }

            let sub

            if (data.list.length > 0) {
              sub = data.list.filter(
                (x) => x.subscription.status === 'active'
              )?.[0]?.subscription
            }

            if (!sub) reject(new Error("Couldn't find subscription"))

            resolve(sub)
          }
        )
    })
  }

  async getAmount(id: Snowflake): Promise<AmountObject> {
    const cached = this.cache.get(id)
    if (cached) return cached

    const user = await this.db.findOne({ id })
    const res = await (async (): Promise<AmountObject> => {
      if (!user || !user.customer) {
        const prem = await this.int.api.getPremium(id)
        if (prem) {
          return {
            amount: prem,
            customer: false
          }
        } else return NONE
      }
      try {
        const sub = await this.getCustomerSub(user.customer)
        if (!sub) return NONE
        return {
          amount: Config.premiumAmounts[sub.plan_id] || 0,
          customer: true
        }
      } catch (err) {
        return NONE
      }
    })()
    this.cache.set(id, res)
    return res
  }

  async register(id: Snowflake, customer: string): Promise<RegisterResponse> {
    const current = await this.db.findOne({ customer })

    if (current) throw new Error('Customer already exists')
    const sub = await this.getCustomerSub(customer)
    if (!sub?.next_billing_at) throw new Error("Couldn't find subscription")

    await this.db.updateOne(
      { id },
      {
        $set: {
          id,
          customer
        }
      },
      {
        upsert: true
      }
    )

    const user = this.caching.users.get(id)
    if (user?.premium) {
      user.premium.count = Config.premiumAmounts[sub.plan_id] || 0

      this.caching.users.set(id, user)

      if (user.premium.count > 0) {
        void this.int.api._request(
          'POST',
          '/premium/webhook/add',
          {
            Authorization: process.env.JPBBOT_PREMIUM_UPDATES
          },
          { id: user.id }
        )
      }
    }

    return {
      error: undefined,
      sub: sub.plan_id as PremiumTypes,
      amount: Config.premiumAmounts[sub.plan_id] || 0,
      endDate: sub.next_billing_at * 1000
    }
  }

  async handleDelete(user: User): Promise<void> {
    await this.database.collection('premium_users').deleteOne({ id: user.id })

    // TODO
    // if (user.premium) {
    //   for (const guild of user.premium?.guilds ?? []) {
    //     try {
    //       this.manager.socket.guilds.cache.delete(guild)
    //       await this.manager.socket.guilds.set(guild)
    //     } catch (err) {
    //       await this.manager.db.collection('guild_data').deleteOne({ id: guild })
    //     }
    //   }
    // }

    void this.int.api._request(
      'POST',
      '/premium/webhook/remove',
      {
        Authorization: process.env.JPBBOT_PREMIUM_UPDATES
      },
      { id: user.id }
    )
  }
}
