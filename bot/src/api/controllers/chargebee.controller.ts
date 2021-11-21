import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import { RegisterInfo, RegisterResponse } from 'typings'
import { Config } from '../../config'
import { CacheService } from '../services/cache.service'
import { ChargeBeeService } from '../services/chargebee.service'
import { InterfaceService } from '../services/interface.service'
import { UsersService } from '../services/users.service'

const changeEvents = [
  'subscription_created',
  'subscription_activated',
  'subscription_changed',
  'subscription_cancelled',
  'subscription_reactivated',
  'subscription_renewed',
  'subscription_deleted',
  'subscription_resumed',
  'payment_failed',
  'payment_refunded',
  'customer_deleted'
]

@Controller('chargebee')
export class ChargeBeeController {
  constructor(
    private readonly chargebee: ChargeBeeService,
    private readonly users: UsersService,
    private readonly caching: CacheService,
    private readonly int: InterfaceService
  ) {}

  @Post('/register')
  async register(@Body() customer: RegisterInfo): Promise<RegisterResponse> {
    try {
      const sub = await this.chargebee.register(
        customer.id,
        customer.customerId
      )
      if (sub) return sub
      else throw new Error('Error')
    } catch (err) {
      return { error: err.message }
    }
  }

  @Post('/webhook')
  async webhookPost(
    @Query('key') key: string,
    @Res() res: Response,
    @Body() body: any
  ) {
    if (key !== Config.chargebee.webhook)
      throw new HttpException('Invalid Key', HttpStatus.FORBIDDEN)

    res.sendStatus(204)

    if (!changeEvents.includes(body?.event_type)) return

    const customer: string = body?.content?.customer?.id
    if (!customer) return

    const user = await this.chargebee.db.findOne({ customer })
    if (!user) return

    this.chargebee.cache.delete(user.id)

    const newAmount = await this.chargebee.getAmount(user.id)
    if (newAmount.amount > 0) return

    await this.chargebee.db.deleteOne({ id: user.id })

    void this.int.api._request(
      'POST',
      '/premium/webhook/remove',
      {
        Authorization: process.env.JPBBOT_PREMIUM_UPDATES
      },
      { id: user.id }
    )

    const current = this.caching.users.get(user.id)
    if (current) {
      const newUser = await this.users.extendUser(current)

      if ((newUser.premium?.count ?? 0) < 1) {
        if (newUser.premium) newUser.premium.guilds = []
      }

      this.caching.users.set(user.id, newUser)
      this.users.emit('USER_UPDATE', newUser)
    }
  }
}
