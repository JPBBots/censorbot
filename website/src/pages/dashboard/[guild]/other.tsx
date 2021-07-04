import { WebhookReplace } from 'typings'
import { Amount } from '~/settings/inputs/Amount'
import { List } from '~/settings/inputs/List'
import { Text } from '~/settings/inputs/Text'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class OtherSection extends SettingsSection {
  render () {
    if (!this.db) return 'err'

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>General</h1>

        <div>
          <Setting title="Anti-Hoist" description="Stops users from hoisting with special characters to get on top of the members list">
            <Toggle setting="antiHoist" value={this.db.antiHoist} />
          </Setting>
          <h1>Popup message</h1>
          <h2>Message that comes up after a user has sworn</h2>
          <Setting title="Message Content" description="What the message will say">
            <Text setting="msg.content" value={this.db.msg.content} extra="TODO" />
          </Setting>
          <Setting title="Delete After" description="Time in seconds it takes until the popup message is deleted">
            <Amount setting="msg.deleteAfter" value={this.db.msg.deleteAfter ?? 0} />
          </Setting>
          <Setting title="DM" description="Whether or not to DM the popup message" premium={true}>
            <Toggle setting="msg.dm" value={this.db.msg.dm} />
          </Setting>
          <h1>Resend</h1>
          <h2>When a users message is deleted, resend it but with the removed text blocked out</h2>
          <Setting title="Enable" description="Enable resending deleted messages" premium={true}>
            <Toggle setting="webhook.enabled" value={this.db.webhook.enabled} />
          </Setting>
          <Setting title="Replace" description="Whether to replace the bad word, if disabled, just spoilers the entire message">
            <Toggle setting="webhook.separate" value={this.db.webhook.separate} />
          </Setting>
          <Setting title="Replace With" description="What to replace swearing text with" premium={true}>
            <List setting="webhook.replace" number={true} value={this.db.webhook.replace}>
              <option value={WebhookReplace.Spoilers}>Spoilers</option>
              <option value={WebhookReplace.Hashtags}>Hashtags</option>
              <option value={WebhookReplace.Stars}>Stars</option>
            </List>
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
