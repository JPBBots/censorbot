import { Cache } from '@jpbberry/cache'

import { Config } from '../../config'

export interface Test {
  bad: boolean
  percent: `${number}%`
}

export class BaseAI {
  cache: Cache<string, Test> = new Cache(Config.ai.cacheWipe)

  ai = Config.ai
}
