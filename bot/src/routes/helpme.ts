import { Router } from 'express'
import { ApiManager } from '../managers/Api'

export default function (this: ApiManager, r: Router): void {
  r
    .get<{
    code: string
  }>('/:code', async (req, res) => {
    if (!req.params.code) return res.json({ id: null })

    const guild = await this.thread.sendCommand('GET_HELPME', { code: req.params.code })

    res.json({
      id: typeof guild === 'string' ? guild : null
    })
  })
}
