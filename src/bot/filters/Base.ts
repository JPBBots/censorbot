import { GuildDB, ExceptionType } from 'typings'
import { WorkerManager, ExceptedData } from '../managers/Worker'
import { EventAdder } from '../utils/EventAdder'

export class BaseFilterHandler extends EventAdder<WorkerManager> {
  constructor(public readonly worker: WorkerManager) {
    super(worker)
  }

  test(content: string, db: GuildDB, data: ExceptedData) {
    return this.worker.filter.test(content, db.filter, {
      server: this.worker.isExcepted(
        ExceptionType.ServerFilter,
        db.exceptions,
        data
      ),
      prebuilt: this.worker.isExcepted(
        ExceptionType.PreBuiltFilter,
        db.exceptions,
        data
      )
    })
  }
}
