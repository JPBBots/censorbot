import type { NextApiRequest, NextApiResponse } from 'next'

export default function Terms(_req: NextApiRequest, res: NextApiResponse) {
  res.redirect('https://www.iubenda.com/terms-and-conditions/23592172')
}
