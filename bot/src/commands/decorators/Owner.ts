import { Decorators } from '@jadl/cmd'
import { WorkerManager } from '../../managers/Worker'

export const Owner = Decorators.createCommandDecorator((_, cmd) => {
  cmd.canRun.push((int, { worker }) => {
    return (worker as WorkerManager).config.owners.includes(
      (int.user ?? int.member!.user!).id
    )
  })
})
