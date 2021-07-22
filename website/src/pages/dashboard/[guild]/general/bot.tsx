import { Text } from '~/settings/inputs/Text'
import { Toggle } from '~/settings/inputs/Toggle'

import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class GeneralSection extends SettingsSection {
  render () {
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Bot Settings</h1>

        <div>
          <Setting title="Prefix" description="The bots prefix ontop of mentioning the bot">
            <Text setting="prefix" value={this.db.prefix} whenNull="None" />
          </Setting>
          <Setting premium={true} title="DM Commands" description="Respond to commands in users DMs rather than publicly">
            <Toggle setting="dm" value={this.db.dm} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
