import type { NextApiRequest, NextApiResponse } from 'next'

export default function Invite(req: NextApiRequest, res: NextApiResponse) {
  res.redirect(
    '/api/invite?id=' +
      String(req.query?.id) +
      '&admin=' +
      String(req.query?.admin)
  )
}
