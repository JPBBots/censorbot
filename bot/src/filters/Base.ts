import { GuildDB, ExceptionType } from '@jpbbots/cb-typings'
import { WorkerManager, ExceptedData } from '../managers/Worker'
import { EventAdder } from '../utils/EventAdder'

export class BaseFilterHandler extends EventAdder<WorkerManager> {
  constructor(public readonly worker: WorkerManager) {
    super(worker)
  }

  test(content: string, db: GuildDB, data: ExceptedData) {
    return this.worker.filter.test(content, db, {
      server: this.worker.isExcepted(ExceptionType.ServerFilter, db, data),
      prebuilt: this.worker.isExcepted(ExceptionType.PreBuiltFilter, db, data)
    })
  }
}
