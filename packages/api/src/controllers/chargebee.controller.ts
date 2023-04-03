import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { Snowflake } from 'discord-api-types/v9'
import { Response } from 'express'
import Config from '@censorbot/config'
import { ChargeBeeService } from '../services/chargebee.service'
import { DatabaseService } from '../services/database.service'
import { GuildsService } from '../services/guilds.service'
import { InterfaceService } from '../services/interface.service'
import { ThreadService } from '../services/thread.service'
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

@Controller('/chargebee')
export class ChargeBeeController {
  constructor(
    private readonly chargebee: ChargeBeeService,
    private readonly users: UsersService,
    private readonly int: InterfaceService,
    private readonly db: DatabaseService,
    private readonly guilds: GuildsService,
    private readonly thread: ThreadService
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

      if (body.event_type === 'customer_created') {
        const customer = body.content.customer
        return await this.chargebee.db.updateOne(
          { id: customer.id },
          { $set: { id: customer.id } },
          { upsert: true }
        )
      }

      if (this.positiveEvents.includes(body.event_type)) {
        const deprecatedUser = await this.chargebee.db.findOne({
          customer: body.content.customer.id
        })

        let userId: Snowflake

        if (deprecatedUser) {
          userId = deprecatedUser.id
        } else {
          userId = body.content.customer.id
        }

        void this.int.api._request(
          'POST',
          '/premium/webhook/add',
          {
            Authorization: process.env.JPBBOT_PREMIUM_UPDATES
          },
          { id: userId }
        )

        const amount = await this.chargebee.getAmount(userId, true)

        void this.thread
          .webhook('premium')
          .color('Green')
          .title(`Customer ${body.event_type}`)
          .description(`<@${userId}>`)
          .field('Deprecated', `${!!deprecatedUser}`, true)
          .field(
            'Subscription',
            `
              Customer = ${amount.customer}
              Plan = ${amount.subscription}
              Servers = ${amount.amount}
            `,
            true
          )
          .send()

        void this.users.causeUpdate(userId)
      }

      if (this.negativeEvents.includes(body.event_type)) {
        const deprecatedCustomer = await this.chargebee.db.findOne({
          customer: body.content.customer.id
        })

        const userId = deprecatedCustomer?.id ?? body.content.customer.id

        if (body.content.customer.deleted) {
          await this.chargebee.db.deleteOne({
            id: userId
          })
        }

        const newAmount = await this.chargebee.getAmount(userId, true)

        const existingPremium = await this.db
          .collection('premium_users')
          .findOne({ id: userId })

        const embed = this.thread
          .webhook('premium')
          .color('Red')
          .title(`Customer ${body.event_type}`)
          .description(`<@${userId}>`)
          .field(`Customer Deleted`, `${body.content.customer.deleted}`, true)
          .field('Deprecated', `${!!deprecatedCustomer}`, true)

        if (newAmount.amount < 1) {
          if (existingPremium) {
            await this.db.collection('premium_users').deleteOne({ id: userId })

            embed.field(
              'Guilds removed',
              `${existingPremium.guilds.length}`,
              true
            )

            for (const guild of existingPremium.guilds) {
              await this.db.removeGuildPremium(guild)

              void this.guilds.updateGuild(guild)
            }
          }

          void this.int.api._request(
            'POST',
            '/premium/webhook/remove',
            {
              Authorization: process.env.JPBBOT_PREMIUM_UPDATES
            },
            {
              id: userId
            }
          )

          if (deprecatedCustomer) {
            // remove deprecated customers completely
            void this.chargebee.chargebee.customer
              .delete(body.content.customer.id)
              .request()
          }
        } else if (existingPremium) {
          const newGuilds = existingPremium.guilds.slice(0, newAmount.amount)

          embed.field(
            'Guilds removed',
            `${existingPremium.guilds.length - newGuilds.length}`,
            true
          )

          await this.db.collection('premium_users').updateOne(
            { id: userId },
            {
              $set: {
                guilds: newGuilds
              }
            }
          )
          for (const guild of existingPremium.guilds) {
            if (!newGuilds.includes(guild)) {
              await this.db.removeGuildPremium(guild)

              void this.guilds.updateGuild(guild)
            }
          }
        }
        void this.users.causeUpdate(userId)
        void embed.send()
      }
    })()
  }
}
