import { BaseExtension, Test } from './Base'
import { request } from 'undici'

interface AntiNsfwApiResponse {
  percentage: number
  nsfw: boolean
}

export class AntiNSFW extends BaseExtension {
  public async test(text: string): Promise<Test> {
    const tested = this.cache.get(text)
    if (tested) return tested

    const { body, statusCode } = await request(
      'http://localhost:5820/scan/image',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ url: text })
      }
    ).catch(() => ({ body: null!, statusCode: 500 }))

    if (statusCode !== 200) {
      this.working = false

      return { bad: false }
    } else {
      this.working = true
    }

    const json: AntiNsfwApiResponse = await body
      .json()
      .catch(() => ({ nsfw: false, percent: 0 }))

    const test: Test = {
      bad: json.nsfw,
      percent: `${(json.percentage * 100).toFixed(0) as unknown as number}%`
    }

    this.cache.set(text, test)

    return test
  }
}
