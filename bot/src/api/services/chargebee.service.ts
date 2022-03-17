import { Injectable } from '@nestjs/common'

import * as chargebeeC from 'chargebee'

import Chargebee from 'chargebee-typescript'
import { Subscription } from 'chargebee-typescript/lib/resources'

import { Collection } from 'mongodb'
import { Snowflake } from 'discord-api-types'

import { Cache } from '@jpbberry/cache'

import { Config } from '../../config'

import { DatabaseService } from './database.service'
import { InterfaceService } from './interface.service'
import { PremiumTypes } from '@jpbbots/cb-typings'

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
  subscription?: PremiumTypes
}

const NONE: AmountObject = {
  amount: 0,
  customer: false
}

type CustomerData =
  | { customer: false }
  | { customer: true; amount: 0 }
  | { customer: true; amount: number; subscription: PremiumTypes }

@Injectable()
export class ChargeBeeService {
  chargebee: Chargebee.ChargeBee = chargebee

  cache: Cache<Snowflake, AmountObject> = new Cache(
    Config.dashboardOptions.wipeTimeout
  )

  amounts: {
    [key: string]: number
  } = {}

  constructor(
    private readonly database: DatabaseService,
    private readonly int: InterfaceService
  ) {
    this.chargebee.configure({
      site: `censorbot${Config.staging ? '-test' : ''}`,
      api_key: Config.chargebee.key
    })

    void this.chargebee.plan.list().request(
      (
        err,
        data: {
          list: Array<{
            plan: { id: PremiumTypes; meta_data: { servers: number } }
          }>
        }
      ) => {
        if (err) return console.error('Unable to request Chargebee plans')

        data.list.forEach(({ plan }) => {
          this.amounts[plan.id] = plan.meta_data.servers
        })
      }
    )
  }

  get db(): Collection<CustomerSchema> {
    return this.database.collection('customers')
  }

  async getCustomerSub(customerId: string): Promise<CustomerData> {
    return await new Promise((resolve, reject) => {
      void this.chargebee.subscription
        .subscriptions_for_customer(customerId)
        .request(
          (err, data: { list: Array<{ subscription: Subscription }> }) => {
            if (err) {
              if (err.error_code === 'resource_not_found') {
                return resolve({ customer: false })
              }
              return reject(new Error(err.message))
            }

            let sub: Subscription | undefined

            if (data.list.length > 0) {
              sub = data.list.filter(
                (x) => x.subscription.status === 'active'
              )?.[0]?.subscription
            }

            if (!sub) return resolve({ customer: true, amount: 0 })

            resolve({
              customer: true,
              amount: this.amounts[sub.plan_id],
              subscription: sub.plan_id as PremiumTypes
            })
          }
        )
    })
  }

  private async _getAmount(id: Snowflake): Promise<AmountObject> {
    const customerId = await this.getCustomerId(id)
    const customer = await this.getCustomerSub(customerId)

    if (customer.customer) return customer

    const prem = await this.int.api.getPremium(id)
    if (prem) {
      return {
        amount: prem,
        customer: false
      }
    } else return NONE
  }

  async getAmount(id: Snowflake, recache = false): Promise<AmountObject> {
    const cached = this.cache.get(id)
    if (cached && !recache) return cached

    const res = await this._getAmount(id)
    this.cache.set(id, res)

    return res
  }

  async getCustomerId(id: Snowflake) {
    const user = await this.db.findOne({ id })
    if (user) return user.customer

    return id
  }
}
