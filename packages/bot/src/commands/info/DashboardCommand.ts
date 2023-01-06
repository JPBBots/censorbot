import { Command, Run } from '@jadl/cmd'
import { Config } from '../../config'

@Command('dashboard', 'Gives link to dashboard')
export class DashboardCommand {
  @Run()
  run() {
    return Config.links.dashboard
  }
}
