import { WorkerManager } from '../managers/Worker'

const worker = new WorkerManager()
import { CommandError } from '@jadl/cmd'

process.on(
  'unhandledRejection',
  (err: CommandError | { nonFatal: boolean } | Error) => {
    if ('nonFatal' in err && err.nonFatal) return

    console.error(err)
    worker.logError(err as Error)
  }
)
