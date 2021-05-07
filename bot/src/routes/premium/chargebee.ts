import { Router } from 'express'
import { ApiManager } from '../../managers/Api'

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
}
