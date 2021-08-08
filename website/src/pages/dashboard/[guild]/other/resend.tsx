import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack, Select } from '@chakra-ui/react'

import { Option } from '~/functional/Option'

import { SettingSection } from '~/settings/SettingSection'
import { WebhookReplace } from 'typings'
import { Tagify } from '~/settings/Tagify'
import { Logger } from 'structures/Logger'

export default function Resend () {
  return (
    <SettingSection section="Resend">
      {
        ({ db, guild, premium }, _setDb, handleFormikSubmit) => (
          <Formik initialValues={{
            webhook: {
              enabled: db.webhook.enabled,
              separate: db.webhook.separate,
              replace: db.webhook.replace,
              ignored: db.webhook.ignored
            }
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              handleChange,
              getFieldHelpers
            }) =>
              <FormControl w="full" onChange={handleSubmit as any}>
                <VStack spacing={2}>
                  <Section>
                    <Option name="webhook.enabled" isChecked={db.webhook.enabled} onChange={handleChange} label="Enable resending deleted messages" isPremium />
                  </Section>
                  <Section title="Replace" description="When disabled, will just censor the entire message">
                    <Option name="webhook.separate" isChecked={db.webhook.separate} onChange={handleChange} label="Replace only bad words." isPremium />
                  </Section>
                  <Section title="Replace With" isPremium>
                    <Select name="webhook.replace" value={db.webhook.replace} onChange={({ target }) => {
                      getFieldHelpers('webhook.replace').setValue(Number(target.value))
                    }}>
                      <option value={WebhookReplace.Spoilers}>Spoilers</option>
                      <option value={WebhookReplace.Hashtags}>Hashtags</option>
                      <option value={WebhookReplace.Stars}>Stars</option>
                    </Select>
                  </Section>
                  <Section title="Resend Ignored Roles" description="Roles to not send resend messages about" isPremium>
                    <Tagify value={db.webhook.ignored} helper={getFieldHelpers('webhook.ignored')} settings={{
                      whitelist: guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
                      maxTags: premium ? Infinity : 0,
                      enforceWhitelist: true,
                      callbacks: {
                        invalid: (e) => {
                          if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to use this')
                        }
                      },
                      dropdown: {
                        enabled: 0,
                        maxItems: guild?.r.length
                      }
                    }}>
                    </Tagify>
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
