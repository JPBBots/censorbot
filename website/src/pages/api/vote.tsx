import type { NextApiRequest, NextApiResponse } from 'next'

export default function Vote(_req: NextApiRequest, res: NextApiResponse) {
  res.redirect('https://top.gg/bot/394019914157129728/vote')
}
