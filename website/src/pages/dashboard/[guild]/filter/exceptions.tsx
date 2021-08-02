import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack, Icon } from '@chakra-ui/react'

import { FaAt, FaHashtag } from 'react-icons/fa'

import { handleFormikSubmit, SettingSection } from '~/SettingSection'
import { Logger } from 'structures/Logger'
import { Tagify } from '~/settings/Tagify'

export default function Exceptions () {
  return (
    <SettingSection section="Exceptions">
      {
        ({ db, guild }) => (
          <Formik initialValues={{
            role: db.role,
            channels: db.channels
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              handleChange,
              setValues,
              values
            }) =>
            <FormControl w="full" onChange={handleSubmit as any}>
                <VStack spacing="sm">
                  <Section title="Ignored Roles" description="Roles that are excepted from filtered words and phrases" icon={<Icon as={FaAt} />}>
                    <Tagify value={db.role} onChange={(val: any) => {
                      console.log(val)
                      setValues({ ...values, role: val })
                    }} placeholder="Add roles" settings={{
                      whitelist: guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
                      enforceWhitelist: true,
                      callbacks: {
                        invalid: (e) => {
                          if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more roles')
                        }
                      },
                      dropdown: {
                        enabled: 0,
                        maxItems: guild?.r.length
                      }
                    }} />
                  </Section>
                  <Section title="Ignored Channels" description="Channels that are excepted from filtered words and phrases" icon={<Icon as={FaHashtag} />}>
                    <Tagify value={db.channels} onChange={(val: any) => {
                      setValues({ ...values, channels: val })
                    }} placeholder="Add roles" settings={{
                      whitelist: guild?.c.map(x => ({ value: `#${x.name}`, id: x.id })),
                      enforceWhitelist: true,
                      callbacks: {
                        invalid: (e) => {
                          if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more channels')
                        }
                      },
                      dropdown: {
                        enabled: 0,
                        maxItems: guild?.c.length
                      }
                    }} />
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
