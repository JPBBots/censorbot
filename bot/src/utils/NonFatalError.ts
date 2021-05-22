import { CommandError } from 'discord-rose'

export class NonFatalError extends CommandError {
  nonFatal = true
}
