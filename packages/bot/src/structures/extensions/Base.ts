import { Cache } from '@jpbberry/cache'

import Config from '@censorbot/config'
import { WorkerManager } from '../../managers/Worker'

export type Test =
  | {
      bad: true
      percent: `${number}%`
    }
  | { bad: false; percent?: `${number}%` }

export class BaseExtension {
  public working = true

  cache: Cache<string, Test> = new Cache(Config.ai.cacheWipe)

  ai = Config.ai

  constructor(public worker: WorkerManager) {}
}
