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

import { SettingSection } from '~/settings/SettingSection'
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
                <VStack spacing={2}>
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
