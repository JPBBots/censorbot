import { Router } from 'express'
import { ApiManager } from '../../managers/Api'

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
  'payment_refunded'
]

export default function (this: ApiManager, r: Router): void {
  r
    .post('/register', async (req, res) => {
      try {
        const sub = await this.chargebee.register(req.body.id, req.body.customerId)
        if (sub) res.json(sub)
        else throw new Error('Error')
      } catch (err) {
        res.json({ error: err.message })
      }
    })

    .post('/webhook', async (req, res) => {
      if (req.query.key !== this.config.chargebee.webhook) return res.sendStatus(403)

      res.sendStatus(204)

      if (!changeEvents.includes(req.body?.event_type)) return

      const customer: string = req.body?.content?.customer?.id
      if (!customer) return

      const user = await this.chargebee.collection.findOne({ customer })
      if (!user) return

      this.chargebee.cache.delete(user.id)

      const current = this.socket.cachedUsers.get(user.id)
      if (current) {
        const newUser = await this.extendUser(current)
        this.socket.cachedUsers.set(user.id, newUser)
        this.socket.connections.forEach(con => {
          if (con.userId === newUser.id) con.sendEvent('UPDATE_USER', newUser)
        })
      }
    })
}
