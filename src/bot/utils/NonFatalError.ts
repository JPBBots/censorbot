import { CommandError } from '@jadl/cmd'

export class NonFatalError extends CommandError {
  nonFatal = true
}
