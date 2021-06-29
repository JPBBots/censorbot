import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class FilterSection extends SettingsSection {
  render () {
    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Filter</h1>
      </SettingsSectionElement>
    )
  }
}
