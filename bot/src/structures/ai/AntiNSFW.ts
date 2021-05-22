import { BaseAI, Test } from './Base'

import deepai from 'deepai'
import { WorkerManager } from '../../managers/Worker'

export class AntiNSFW extends BaseAI {
  constructor (worker: WorkerManager) {
    super(worker)

    deepai.setApiKey(worker.config.ai.antiNsfwKey)
  }

  public async test (text: string): Promise<Test> {
    const tested = this.cache.get(text)
    if (tested) return tested

    const fetched = await deepai.callStandardApi('nsfw-detector', {
      image: text
    }).catch(() => false)

    if (!fetched) return { bad: false, percent: '0%' }

    const num: number = fetched.output.nsfw_score

    const test: Test = {
      bad: num >= this.ai.predictionMin,
      percent: `${Number((num * 100).toFixed(0))}%` as `${number}%`
    }

    this.cache.set(text, test)

    return test
  }
}
