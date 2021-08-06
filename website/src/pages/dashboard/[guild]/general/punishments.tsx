export default function Punishment () {
  return <h1>e</h1>
}

// import React from 'react'
// import { Logger } from 'structures/Logger'

// import { Amount } from '~/settings/inputs/Amount'
// import { List } from '~/settings/inputs/List'
// import { Tags } from '~/settings/inputs/Tags'

// import { Setting } from '~/settings/Setting'
// import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

// export default class FilterSection extends SettingsSection {
//   censorSetting (elm: React.RefObject<HTMLElement>) {
//     const elms = Array.from(document.querySelectorAll<HTMLInputElement>('[data-setting=censor]'))

//     let res = 0
//     elms.forEach(c => {
//       const en = Number(c.getAttribute('data-extra'))
//       const cur = Number(elm.current?.getAttribute('data-extra'))

//       if (this.db && en === cur && (this.db.censor & cur) !== 0) return

//       if (c.checked) res |= en
//     })

//     return res
//   }

//   render () {
//     if (!this.db) return <div></div>

//     return (
//       <SettingsSectionElement ctx={this.context}>
//         <h1>Punishments</h1>

//         <div>
//           If a user curses <Amount setting="punishment.amount" value={this.db.punishment.amount} /> times <br />
//           Within ... <br />
//           Then <List setting="punishment.type" customGet={((elm) => {
//           if (!elm.current) return

//           return Number(elm.current.value)
//         })} value={this.db.punishment.type}>
//             <option value="0">Do nothing</option>
//             <option value="1">Give them a role</option>
//             <option value="2">Kick them</option>
//             <option value="3">Ban them</option>
//           </List>
//         </div>

//         <Setting title="Punishment Exempt Roles" description="Roles to not distribute punishments to">
//             <Tags setting="punishment.ignored" value={this.db.punishment.ignored} placeholder="Add roles" settings={{
//               whitelist: this.guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
//               enforceWhitelist: true,
//               callbacks: {
//                 invalid: (e) => {
//                   if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more roles')
//                 }
//               },
//               dropdown: {
//                 enabled: 0,
//                 maxItems: this.guild?.r.length
//               }
//             }} />
//           </Setting>
//       </SettingsSectionElement>
//     )
//   }
// }
