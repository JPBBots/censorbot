import { ExtendedEmitter } from '@jpbberry/typed-emitter'
import { GuildDB, ExceptionType } from 'typings'
import { WorkerManager, ExceptedData } from '../managers/Worker'

export class BaseFilterHandler extends ExtendedEmitter {
  constructor(public readonly worker: WorkerManager) {
    super()
  }

  test(content: string, db: GuildDB, data: ExceptedData) {
    return this.worker.filter.test(content, db, {
      server: this.worker.isExcepted(ExceptionType.ServerFilter, db, data),
      prebuilt: this.worker.isExcepted(ExceptionType.PreBuiltFilter, db, data)
    })
  }
}
