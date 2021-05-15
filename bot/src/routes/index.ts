import { Router } from 'express'
import { ApiManager } from '../managers/Api'

export default function (this: ApiManager, r: Router): void {
  r
    .get('/', (req, res) => {
      res.json({
        hello: 'world',
        worker: this.id,
        region: this.region
      })
    })
}
