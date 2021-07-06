import { WebhookReplace } from 'typings'
import { List } from '~/settings/inputs/List'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class OtherSection extends SettingsSection {
  render () {
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
      <h1>Resend</h1>
      <h2>When a users message is deleted, resend it but with the removed text blocked out</h2>

        <div>
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
