import React from 'react'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class FilterSection extends SettingsSection {
  render () {
    if (!this.db) return 'err'

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Extras</h1>

        <div>
          <Setting title="Censor Invites" description="Remove any Discord server invites">
            <Toggle setting="invites" value={this.db.invites} />
          </Setting>
          <Setting title="Multi-Line" description="Recognize text over multiple messages" premium={true}>
            <Toggle setting="multi" value={this.db.multi} />
          </Setting>
          <Setting title="Ignore NSFW Channels" description="Whether or not to ignore channels marked as NSFW">
            <Toggle setting="nsfw" value={this.db.nsfw} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
