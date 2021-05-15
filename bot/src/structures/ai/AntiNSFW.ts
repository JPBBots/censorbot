import { BaseAI, Test } from './Base'

import fetch from 'node-fetch'

export class AntiNSFW extends BaseAI {
  public async test (text: string): Promise<Test> {
    const tested = this.cache.get(text)
    if (typeof tested === 'boolean') return tested

    const fetched = await fetch('https://no.kinky.zone/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: this.ai.antiNsfwKey,
        url: text
      })
    }).then(async (x) => await x.json())

    const num: number = fetched.predictions.reduce((a, b) => {
      if (!['Hentai', 'Porn'].includes(b.className)) return a
      if (b.probability > a) return b.probability
      return a
    }, 0)

    const test: Test = {
      bad: num >= this.ai.predictionMin,
      percent: `${(num * 100).toFixed(0)}%` as `${number}%`
    }

    this.cache.set(text, test)

    return test
  }
}
