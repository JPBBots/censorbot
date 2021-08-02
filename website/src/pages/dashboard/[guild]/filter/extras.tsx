import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack } from '@chakra-ui/react'

import { Option } from '~/functional/Option'

import { handleFormikSubmit, SettingSection } from '~/SettingSection'

export default function Filter () {
  return (
    <SettingSection section="Extras">
      {
        ({ db }) => (
          <Formik initialValues={{
            invites: db.invites,
            multi: db.multi,
            nsfw: db.nsfw,
            antiHoist: db.antiHoist
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              handleChange
            }) =>
              <FormControl w="full" onChange={handleSubmit as any}>
                <VStack spacing="sm">
                  <Section title="Multi-Line">
                    <Option name="multi" isChecked={db.multi} onChange={handleChange} label="Recognize text over multiple messages" isPremium />
                  </Section>
                  <Section title="Censor Invites">
                    <Option name="invites" isChecked={db.invites} onChange={handleChange} label="Remove any Discord server invites" />
                  </Section>
                  <Section title="Ignore NSFW Channels">
                    <Option name="nsfw" isChecked={db.nsfw} onChange={handleChange} label="Ignore messages in channels marked as NSFW" />
                  </Section>
                  <Section title="Anti-Hoist">
                    <Option name="antiHoist" isChecked={db.antiHoist} onChange={handleChange} label="Prevent users from hoisting with special characters to get on top of the member list" />
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
