import { Snowflake } from 'discord-rose'
import { Router } from 'express'
import { ApiManager } from '../../managers/Api'

export default function (this: ApiManager, r: Router): void {
  r.get<{
    id: Snowflake
  }>('/:id', async (req, res) => {
    res.json(await this.chargebee.getAmount(req.params.id))
  })
}
