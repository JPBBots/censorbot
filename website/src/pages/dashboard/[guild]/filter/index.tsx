// import React from 'react'

// import { TagifySettings } from '@yaireo/tagify'

// import { Logger } from 'structures/Logger'

import { CensorMethods } from 'typings'

// import { Tags } from '~/settings/inputs/Tags'
// import { Toggle } from '~/settings/inputs/Toggle'

// import { Setting } from '~/settings/Setting'
// import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

import { Formik, FormikHelpers } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack } from '@chakra-ui/react'

import { Option } from '~/functional/Option'

import { SettingSection } from '~/SettingSection'
import { Tagify } from '~/settings/Tagify'
import { TagifySettings } from '@yaireo/tagify'
import { Logger } from 'structures/Logger'
import { useGuild } from 'hooks/useGuilds'

const handleCensorChange = (values: any, setValues: FormikHelpers<any>['setValues'], method: CensorMethods) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setValues({ ...values, censor: values.censor | method })
    } else {
      setValues({ ...values, censor: values.censor & ~method })
    }
  }
}

export default function General ({ data }: CB.Props) {
  const [guild] = useGuild()

  const baseListSettings: TagifySettings = {
    delimiters: /,/g,
    pattern: /^.{1,20}$/,
    maxTags: guild?.premium ? 1500 : 150,
    callbacks: {
      invalid: (e) => {
        console.log(e)
        if (e.detail.message === 'pattern mismatch') Logger.error('Word cannot be over 20 characters long.')
        if (e.detail.message === 'number of tags exceeded') Logger.error('Reached max words. Get premium to get up to 1500!')
      }
    }
  }

  const listSettings = {
    ...baseListSettings,
    delimiters: /,|\s/g
  } as TagifySettings

  return (
    <SettingSection section="General">
      {
        ({ db }, _, handleFormikSubmit) => (
          <Formik initialValues={{
            censor: db.censor,
            filters: db.filters,
            filter: db.filter,
            phrases: db.phrases,
            uncensor: db.uncensor
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              handleChange,
              getFieldHelpers,
              values,
              setValues
            }) =>
              <FormControl w="full" onChange={handleSubmit as any}>
                <VStack spacing="sm">
                  <Section title="Pre-made Filters" description="Pick pre-made filters that apply for your needs">
                    <Tagify value={db.filters} helper={getFieldHelpers('filters')} placeholder="Add filters" settings={{
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
                    }} />
                  </Section>
                  <Section title="Server Filter" description="Simple words to resolve that add onto your servers' filter">
                    <Tagify value={db.filter} helper={getFieldHelpers('filter')} placeholder="Add words" settings={listSettings} />
                  </Section>
                  <Section title="Phrase Filters" description="Words to remove that contain any character, including spaces">
                    <Tagify value={db.phrases} helper={getFieldHelpers('phrases')} placeholder="Add phrases" settings={baseListSettings} />
                  </Section>
                  <Section title="Uncensor List" description="Words to ignore when they’re matched against a filter">
                    <Tagify value={db.uncensor} helper={getFieldHelpers('uncensor')} placeholder="Add words" settings={listSettings} />
                  </Section>
                  <Section title="Censor Methods">
                    <Option name="censor.0" isChecked={(db.censor & CensorMethods.Messages) !== 0} onChange={handleCensorChange(values, setValues, CensorMethods.Messages)} label="Filter sent and edited messages" />
                    <Option name="censor.2" isChecked={(db.censor & CensorMethods.Names) !== 0} onChange={handleCensorChange(values, setValues, CensorMethods.Names)} label="Filter usernames and nicknames" />
                    <Option name="censor.4" isChecked={(db.censor & CensorMethods.Reactions) !== 0} onChange={handleCensorChange(values, setValues, CensorMethods.Reactions)} label="Filter reactions on messages" />
                  </Section>
                </VStack>
              </FormControl>
            }
          </Formik>
        )
      }
    </SettingSection>
  )
}

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
//         <h1>Filter</h1>

//         <div>
//           <Setting title="Pre-built Filters" description="Pick and choose which filters you want">
//             <Tags setting="filters" value={this.db.filters} placeholder="Add filters" settings={{
// whitelist: [
//   { id: 'en', value: 'English' },
//   { id: 'es', value: 'Spanish' },
//   { id: 'off', value: 'Offensive' },
//   { id: 'de', value: 'German' },
//   { id: 'ru', value: 'Russian' }
// ],
// enforceWhitelist: true,
// callbacks: {},
// dropdown: {
//   enabled: 0
// }
//             }}></Tags>
//           </Setting>
//           <Setting title="Server Filter" description="Custom words for just your server">
//             <Tags setting="filter" placeholder="Add words" settings={listSettings} value={this.db.filter}></Tags>
//           </Setting>
//           <Setting title="Phrase Filter" description="Words to remove that contain any character, including spaces">
//             <Tags setting="phrases" placeholder="Add phrases" settings={baseListSettings} value={this.db.phrases}></Tags>
//           </Setting>
//           <Setting title="Uncensor List" description="Words to ignore when they're matched against a word">
//             <Tags setting="uncensor" placeholder="Add words" settings={listSettings} value={this.db.uncensor}></Tags>
//           </Setting>

//           <h1>Methods</h1>
//           <Setting title="Messages" description="Whether to filter out messages">
//             <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Messages} value={(this.db.censor & CensorMethods.Messages) !== 0} />
//           </Setting>
//           <Setting title="Names" description="Whether to filter out nicknames and usernames">
//             <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Names} value={(this.db.censor & CensorMethods.Names) !== 0} />
//           </Setting>
//           <Setting title="Reactions" description="Whether to filter out reactions on messages">
//             <Toggle setting="censor" customGet={this.censorSetting} data-extra={CensorMethods.Reactions} value={(this.db.censor & CensorMethods.Reactions) !== 0} />
//           </Setting>
//         </div>
//       </SettingsSectionElement>
//     )
//   }
// }
