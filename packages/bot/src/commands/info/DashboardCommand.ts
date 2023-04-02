import { Command, Run } from '@jadl/cmd'
import Config from '@censorbot/config'

@Command('dashboard', 'Gives link to dashboard')
export class DashboardCommand {
  @Run()
  run() {
    return Config.links.dashboard
  }
}
