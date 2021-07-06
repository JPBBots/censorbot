import React from 'react'
import { Amount } from '~/settings/inputs/Amount'
import { List } from '~/settings/inputs/List'
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
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>Punishments</h1>

        <div>
          If a user curses <Amount setting="punishment.amount" value={this.db.punishment.amount} /> times <br />
          Within ... <br />
          Then <List setting="punishment.type" customGet={((elm) => {
          if (!elm.current) return

          return Number(elm.current.value)
        })} value={this.db.punishment.type}>
            <option value="0">Do nothing</option>
            <option value="1">Give them a role</option>
            <option value="2">Kick them</option>
            <option value="3">Ban them</option>
          </List>
        </div>
      </SettingsSectionElement>
    )
  }
}
