import { BaseExtension } from './Base'

import fetch from 'node-fetch'

const domainRegex =
  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/

export class AntiPhish extends BaseExtension {
  public async resolve(message: string): Promise<boolean> {
    if (!message.match(domainRegex)) return false

    const res = await fetch('https://anti-fish.bitflow.dev/check', {
      method: 'POST',
      headers: {
        'User-Agent': 'Censor-Bot (https://censor.bot)',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message
      })
    })
      .then(async (x) => {
        if (!x.ok) throw new Error('OCR Failed')

        return await x.json()
      })
      .catch(() => false)

    this.working = !!res

    return res?.match ?? false
  }
}
