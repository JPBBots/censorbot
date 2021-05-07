import * as chargebeeC from 'chargebee'

import Chargebee from 'chargebee-typescript'
import { Subscription } from 'chargebee-typescript/lib/resources'

import { Collection } from 'mongodb'
import { Snowflake } from 'discord-api-types'

import { ApiManager } from '../../managers/Api'
import { PremiumTypes, RegisterResponse } from 'typings'

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

export class ChargeBee {
  chargebee: Chargebee.ChargeBee = chargebee

  constructor (private readonly manager: ApiManager) {
    this.chargebee.configure({
      site: 'censorbot-test',
      api_key: this.manager.config.chargebeeKey
    })
  }

  get collection (): Collection<CustomerSchema> {
    return this.manager.db.collection('customers')
  }

  async getCustomerSub (customer: string): Promise<Subscription> {
    return await new Promise((resolve, reject) => {
      void this.chargebee.subscription.subscriptions_for_customer(customer).request((err, data: { list: Array<{ subscription: Subscription }> }) => {
        if (err) {
          if (err.error_code === 'resource_not_found') {
            return reject(new Error('Couldn\'t find subscription'))
          }
          return reject(new Error(err.message))
        }

        let sub

        if (data.list.length > 0) {
          sub = data.list
            .filter(x => x.subscription.status === 'active')[0].subscription
        }

        if (!sub) reject(new Error('Couldn\'t find subscription'))

        resolve(sub)
      })
    })
  }

  async getAmount (id: Snowflake): Promise<number> {
    const user = await this.collection.findOne({ id })
    if (!user || !user.customer) return 0
    try {
      const sub = await this.getCustomerSub(user.customer)
      if (!sub) return 0
      return this.manager.config.premiumAmounts[sub.plan_id] || 0
    } catch (err) {
      return 0
    }
  }

  async register (id: Snowflake, customer: string): Promise<RegisterResponse> {
    const current = await this.collection.findOne({ customer })

    if (current) throw new Error('Customer already exists')
    const sub = await this.getCustomerSub(customer)
    if (!sub?.next_billing_at) throw new Error('Couldn\'t find subscription')

    await this.collection.updateOne({ id }, {
      $set: {
        id,
        customer
      }
    }, {
      upsert: true
    })

    const user = this.manager.socket.cachedUsers.get(id)
    if (user?.premium) {
      user.premium.count = this.manager.config.premiumAmounts[sub.plan_id] || 0

      this.manager.socket.cachedUsers.set(id, user)
    }

    return {
      sub: sub.plan_id as PremiumTypes,
      amount: this.manager.config.premiumAmounts[sub.plan_id] || 0,
      endDate: sub.next_billing_at * 1000
    }
  }
}
