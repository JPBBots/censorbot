import { Logger } from 'structures/Logger'
import { List } from '~/settings/inputs/List'
import { Tags } from '~/settings/inputs/Tags'
import { Text } from '~/settings/inputs/Text'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class GeneralSection extends SettingsSection {
  render () {
    if (!this.db) return 'err'

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>General</h1>

        <div>
          <Setting title="Prefix" description="The bots prefix ontop of mentioning the bot">
            <Text setting="prefix" value={this.db.prefix} whenNull="None" />
          </Setting>
          <Setting title="Log Channel" description="Channel to log censored content and punishments">
            <List setting="log" value={this.db.log}>
              {this.guild?.c.map(x => <option value={x.id} key={x.id}>
                #{x.name}
              </option>)}
            </List>
          </Setting>
          <Setting premium={true} title="DM Commands" description="Respond to commands in users DMs rather than publicly">
            <Toggle setting="dm" value={this.db.dm} />
          </Setting>
          <Setting title="Ignored Roles" description="Roles to ignore curses from">
            <Tags setting="role" value={this.db.role} settings={{
              whitelist: this.guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
              enforceWhitelist: true,
              callbacks: {
                invalid: (e) => {
                  if ((e.detail.message as unknown as string) === 'number of tags exceeded') Logger.error('You need premium to add more roles')
                }
              },
              dropdown: {
                enabled: 0,
                maxItems: this.guild?.r.length
              }
            }} />
          </Setting>
          <Setting title="Ignored Channels" description="Channels to ignore curses from">
            <Tags setting="channels" value={this.db.channels} extra={{
              whitelist: this.guild?.c.map(x => ({ value: `#${x.name}`, id: x.id })),
              enforceWhitelist: true,
              callbacks: {
                invalid: (e) => {
                  if ((e.detail.message as unknown as string) === 'number of tags exceeded') Logger.error('You need premium to add more channels')
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
