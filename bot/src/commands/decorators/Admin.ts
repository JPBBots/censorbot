import { Decorators } from '@jadl/cmd'
import { WorkerManager } from '../../managers/Worker'

export const Admin = Decorators.createCommandDecorator((_, cmd) => {
  cmd.canRun.push(async (int, { worker }) => {
    return await (worker as WorkerManager).isAdmin(
      (int.user ?? int.member!.user!).id
    )
  })
})
