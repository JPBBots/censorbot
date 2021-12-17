import { Decorators } from '@jadl/cmd'
import { WorkerManager } from '../../managers/Worker'

export const Admin = Decorators.createCommandDecorator((_, cmd) => {
  cmd.canRun.push((int, { worker }) => {
    return (worker as WorkerManager).isAdmin((int.user ?? int.member?.user!).id)
  })
})
