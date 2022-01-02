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
import { Config } from '../../config'
import { ChargeBeeService } from '../services/chargebee.service'
import { DatabaseService } from '../services/database.service'
import { GuildsService } from '../services/guilds.service'
import { InterfaceService } from '../services/interface.service'
import { UsersService } from '../services/users.service'

interface WebhookEvent {
  content: {
    customer: {
      id: string
      email: string
      deleted: boolean
    }
  }
  event_type: string
}

@Controller('chargebee')
export class ChargeBeeController {
  constructor(
    private readonly chargebee: ChargeBeeService,
    private readonly users: UsersService,
    private readonly int: InterfaceService,
    private readonly db: DatabaseService,
    private readonly guilds: GuildsService
  ) {}

  negativeEvents = [
    'subscription_changed',
    'subscription_cancelled',
    'subscription_deleted',
    'payment_failed',
    'customer_deleted'
  ]

  positiveEvents = [
    'subscription_created',
    'subscription_activated',
    'subscription_reactivated',
    'subscription_resumed'
  ]

  @Post('/webhook')
  async webhookPost(
    @Query('key') key: string,
    @Res() res: Response,
    @Body() body: WebhookEvent
  ) {
    if (key !== Config.chargebee.webhook)
      throw new HttpException('Invalid Key', HttpStatus.FORBIDDEN)

    res.sendStatus(204)
    void (async () => {
      if (!body) return

      if (this.positiveEvents.includes(body.event_type)) {
        const existingUser = await this.chargebee.db.findOne({
          customer: body.content.customer.id
        })
        if (existingUser) return

        const email = body.content.customer.email

        const user = await this.users.db.findOne({ email })
        if (!user) return

        console.log(
          `Linking user ${user.id} to customer ${body.content.customer.id} under email ${email}`
        )

        await this.chargebee.db.updateOne(
          { id: user.id },
          {
            $set: {
              id: user.id,
              customer: body.content.customer.id
            }
          },
          {
            upsert: true
          }
        )

        void this.int.api._request(
          'POST',
          '/premium/webhook/add',
          {
            Authorization: process.env.JPBBOT_PREMIUM_UPDATES
          },
          { id: user.id }
        )

        void this.users.causeUpdate(user.id)
      }

      if (this.negativeEvents.includes(body.event_type)) {
        const user = await this.chargebee.db.findOne({
          customer: body.content.customer.id
        })
        if (!user) return

        if (body.content.customer.deleted)
          await this.chargebee.db.deleteOne({
            customer: body.content.customer.id
          })

        this.chargebee.cache.delete(user.id)
        const newAmount = await this.chargebee.getAmount(user.id)

        const existingPremium = await this.db
          .collection('premium_users')
          .findOne({ id: user.id })

        if (newAmount.amount < 1) {
          console.log(`Customer ${body.content.customer.id} deleted`)
          if (existingPremium) {
            for (const guild of existingPremium.guilds) {
              await this.db.removeGuildPremium(guild)

              void this.guilds.updateGuild(guild)
            }

            await this.db.collection('premium_users').deleteOne({ id: user.id })
          }

          void this.int.api._request(
            'POST',
            '/premium/webhook/remove',
            {
              Authorization: process.env.JPBBOT_PREMIUM_UPDATES
            },
            {
              id: user.id
            }
          )
        } else {
          if (!existingPremium) return

          const newGuilds = existingPremium.guilds.slice(0, newAmount.amount)
          for (const guild of existingPremium.guilds) {
            if (!newGuilds.includes(guild)) {
              await this.db.removeGuildPremium(guild)

              void this.guilds.updateGuild(guild)
            }
          }

          await this.db.collection('premium_users').updateOne(
            { id: user.id },
            {
              $set: {
                guilds: newGuilds
              }
            }
          )
        }
        void this.users.causeUpdate(user.id)
      }
    })()
  }
}
