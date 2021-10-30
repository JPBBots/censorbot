import type { NextApiRequest, NextApiResponse } from 'next'

export default function Privacy(_req: NextApiRequest, res: NextApiResponse) {
  res.redirect('https://www.iubenda.com/privacy-policy/23592172/full-legal')
}
