/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Amount } from '~/settings/inputs/Amount'
import { Text } from '~/settings/inputs/Text'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class OtherSection extends SettingsSection {
  render () {
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
      <h1>Popup message</h1>
      <h2>Message that comes up after a user has sworn</h2>

        <div>
          <Setting title="Message Content" description="What the message will say">
            <Text setting="msg.content" value={this.db.msg.content || ''} whenNull="TODO" />
          </Setting>
          <Setting title="Delete After" description="Time in seconds it takes until the popup message is deleted">
            <Amount setting="msg.deleteAfter" value={this.db.msg.deleteAfter ?? 0} />
          </Setting>
          <Setting title="DM" description="Whether or not to DM the popup message" premium={true}>
            <Toggle setting="msg.dm" value={this.db.msg.dm} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
