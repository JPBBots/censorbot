import { TagifySettings } from '@yaireo/tagify'
import React from 'react'
import { Logger } from 'structures/Logger'
import { CensorMethods } from 'typings'
import { Tags } from '~/settings/inputs/Tags'
import { Toggle } from '~/settings/inputs/Toggle'
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
  censorSetting (elm: React.RefObject<HTMLElement>) {
    const elms = Array.from(document.querySelectorAll<HTMLInputElement>('[data-setting=censor]'))

    let res = 0
    elms.forEach(c => {
      const en = Number(c.getAttribute('data-extra'))
      const cur = Number(elm.current?.getAttribute('data-extra'))

      if (this.db && en === cur && (this.db.censor & cur) !== 0) return

      if (c.checked) res |= en
    })

    return res
  }

  render () {
    if (!this.db) return 'err'

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Filter</h1>

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
          <h1>Censor Methods</h1>
          <Setting title="Messages" description="Whether to filter out messages">
            <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Messages} value={(this.db.censor & CensorMethods.Messages) !== 0} />
          </Setting>
          <Setting title="Names" description="Whether to filter out nicknames and usernames">
            <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Names} value={(this.db.censor & CensorMethods.Names) !== 0} />
          </Setting>
          <Setting title="Reactions" description="Whether to filter out reactions on messages">
            <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Reactions} value={(this.db.censor & CensorMethods.Reactions) !== 0} />
          </Setting>

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

          <h1>AI</h1>
          <Setting premium={true} title="Toxicity Filter" description="Filter out toxic messages with AI">
            <Toggle setting="toxicity" value={this.db.toxicity} />
          </Setting>
          <Setting premium={true} title="Anti-NSFW Images" description="Improve upon Discord's built in image moderation, with a more aggressive AI">
            <Toggle setting="images" value={this.db.images} />
          </Setting>
          <Setting premium={true} title="OCR" description="Optical Character Recognition, which takes an image and scans the text in it">
            <Toggle setting="ocr" value={this.db.ocr} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
