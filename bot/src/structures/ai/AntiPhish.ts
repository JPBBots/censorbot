import { BaseAI } from './Base'

import fetch from 'node-fetch'

const domainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/

export class AntiPhish extends BaseAI {
  public async resolve (message: string): Promise<boolean> {
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
    }).then(async (x) => await x.json()).catch(() => ({}))

    return res?.match ?? false
  }
}
