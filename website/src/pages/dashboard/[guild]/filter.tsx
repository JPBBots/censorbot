import React from 'react'
import { CensorMethods } from 'typings'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

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
            <Toggle setting="censor" customGet={this.censorSetting} extra={CensorMethods.Messages} value={(this.db.censor & CensorMethods.Messages) !== 0} />
          </Setting>
          <Setting title="Names" description="Whether to filter out nicknames and usernames">
            <Toggle setting="censor" customGet={this.censorSetting} extra={CensorMethods.Names} value={(this.db.censor & CensorMethods.Names) !== 0} />
          </Setting>
          <Setting title="Reactions" description="Whether to filter out reactions on messages">
            <Toggle setting="censor" customGet={this.censorSetting} extra={CensorMethods.Reactions} value={(this.db.censor & CensorMethods.Reactions) !== 0} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
