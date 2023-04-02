import { Command, Run } from '@jadl/cmd'
import { Embed } from '@jadl/builders'

import Config from '@censorbot/config'

const { links } = Config

@Command('help', 'Displays helpful links and info')
export class HelpCommand {
  @Run()
  run() {
    return new Embed()
      .description(`Change the bot here: ${links.dashboard}`)
      .field(
        'Helpful links',
        `[Dashboard](${links.dashboard}) | [Support](${links.support}) | [Invite](${links.invite})\n[Website](${links.site}) | [Premium](${links.premium})`
      )
      .field(
        'Helpful commands',
        '**/debug**: Debugs the bot in your server\n' +
          '**/snipe**: Snipes the last deleted message\n' +
          '**/scan**: Scans the last 100 messages and deletes any with curses\n' +
          "**/ticket**: For words that should't be censored"
      )
  }
}
