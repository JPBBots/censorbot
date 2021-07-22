import { Logger } from 'structures/Logger'

import { Tags } from '~/settings/inputs/Tags'

import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class GeneralSection extends SettingsSection {
  render () {
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>General</h1>

        <div>
          <Setting title="Ignored Roles" description="Roles to ignore curses from">
            <Tags setting="role" value={this.db.role} placeholder="Add roles" settings={{
              whitelist: this.guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
              enforceWhitelist: true,
              callbacks: {
                invalid: (e) => {
                  if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more roles')
                }
              },
              dropdown: {
                enabled: 0,
                maxItems: this.guild?.r.length
              }
            }} />
          </Setting>
          <Setting title="Ignored Channels" description="Channels to ignore curses from">
            <Tags setting="channels" placeholder="Add channels" value={this.db.channels} settings={{
              whitelist: this.guild?.c.map(x => ({ value: `#${x.name}`, id: x.id })),
              enforceWhitelist: true,
              callbacks: {
                invalid: (e) => {
                  if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more channels')
                }
              },
              dropdown: {
                enabled: 0,
                maxItems: this.guild?.c.length
              }
            }} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
