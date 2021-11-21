import { BaseAI, Test } from './Base'

import fetch from 'node-fetch'

export class PerspectiveApi extends BaseAI {
  public async test(text: string): Promise<Test> {
    const tested = this.cache.get(text)
    if (tested) return tested

    const fetched = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.ai.perspectiveKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: { text },
          languages: ['en'],
          requestedAttributes: { TOXICITY: {} }
        })
      }
    )
      .then(async (x) => await x.json())
      .catch(() => false)

    if (!fetched) return { bad: false, percent: '0%' }

    const num: number = fetched.attributeScores?.TOXICITY?.summaryScore.value

    const test: Test = {
      bad: num >= this.ai.predictionMin,
      percent: `${(num * 100).toFixed(0)}%` as `${number}%`
    }

    this.cache.set(text, test)

    return test
  }
}
