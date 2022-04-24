import { BaseExtension, Test } from './Base'

import fetch from 'node-fetch'
import FormData from 'form-data'

interface UnscanPartialResponse {
  success: boolean
  nsfw: boolean
  scores: {
    safe: number
    nsfw: number
  }
}

export class AntiNSFW extends BaseExtension {
  async fetchImage(url: string) {
    return fetch(url)
      .then((x) => x.buffer())
      .catch(() => undefined)
  }

  public async test(text: string): Promise<Test> {
    console.log(text)
    const tested = this.cache.get(text)
    if (tested) return tested

    const image = await this.fetchImage(text)
    if (!image) return { bad: false }

    const formData = new FormData()
    formData.append('file', image)

    const req = (await fetch('https://api.unscan.co/nsfw', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then((x) => x.json())) as UnscanPartialResponse

    console.debug(req)

    if (!req.success) return { bad: false }

    const test: Test = {
      bad: req.nsfw,
      percent: `${req.scores.nsfw}%`
    }

    this.cache.set(text, test)

    return test
  }
}
