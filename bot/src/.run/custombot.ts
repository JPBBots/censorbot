import { CustomBot } from '../managers/CustomBot'

const worker = new CustomBot()
import { CommandError } from '@jadl/cmd'

process.on(
  'unhandledRejection',
  (err: CommandError | { nonFatal: boolean } | Error) => {
    if ('nonFatal' in err && err.nonFatal) return

    console.error(err)
    worker.logError(err as Error)
  }
)
