import { TagifySettings } from '@yaireo/tagify'
import React from 'react'
import { Logger } from 'structures/Logger'
import { Tags } from '~/settings/inputs/Tags'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

const baseListSettings = {
  delimiters: /,/g,
  pattern: /^.{1,20}$/,
  callbacks: {
    invalid: (e) => {
      console.log(e)
      if ((e.detail.message as unknown as string) === 'pattern mismatch') Logger.error('Word cannot be over 20 characters long.')
      if ((e.detail.message as unknown as string) === 'number of tags exceeded') Logger.error('Reached max words. Get premium to get up to 1500!')
    }
  }
} as TagifySettings

const listSettings = {
  ...baseListSettings,
  delimiters: /,|\s/g
} as TagifySettings

export default class FilterSection extends SettingsSection {
  render () {
    if (!this.db) return 'err'

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Filter</h1>

        <div>
          <Setting title="Pre-built Filters" description="Pick and choose which filters you want">
            <Tags setting="filters" value={this.db.filters} settings={{
              whitelist: [
                { id: 'en', value: 'English' },
                { id: 'es', value: 'Spanish' },
                { id: 'off', value: 'Offensive' },
                { id: 'de', value: 'German' },
                { id: 'ru', value: 'Russian' }
              ],
              enforceWhitelist: true,
              callbacks: {},
              dropdown: {
                enabled: 0
              }
            }}></Tags>
          </Setting>
          <Setting title="Server Filter" description="Custom words for just your server">
            <Tags setting="filter" settings={listSettings} value={this.db.filter}></Tags>
          </Setting>
          <Setting title="Phrase Filter" description="Words to remove that contain any character, including spaces">
            <Tags setting="phrases" settings={baseListSettings} value={this.db.phrases}></Tags>
          </Setting>
          <Setting title="Uncensor List" description="Words to ignore when they're matched against a word">
            <Tags setting="uncensor" settings={listSettings} value={this.db.uncensor}></Tags>
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
