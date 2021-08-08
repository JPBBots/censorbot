import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack, Input, Select } from '@chakra-ui/react'

import { Option } from '~/functional/Option'

import { SettingSection } from '~/settings/SettingSection'

export default function Bot () {
  return (
    <SettingSection section="Bot">
      {
        ({ db, guild }, _, handleFormikSubmit) => (
          <Formik initialValues={{
            prefix: db.prefix,
            dm: db.dm
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              getFieldHelpers,
              handleChange
            }) =>
              <FormControl w="full" onChange={handleSubmit as any}>
                <VStack spacing={2}>
                  <Section title="Prefix" description="A customized prefix that the bot will respond to">
                    <Input value={db.prefix ?? ''} placeholder="None" name="prefix" onChange={(ev) => {
                      getFieldHelpers('prefix').setValue(ev.target.value === '' ? null : ev.target.value)
                    }} />
                  </Section>
                  <Section title="DM Commands">
                    <Option name="dm" isChecked={db.dm} onChange={handleChange} label="Respond to bot commands in a user’s Direct Messages rather than publicly" isPremium />
                  </Section>
                  <Section title="Log Channel" description="Channel to log all curses and punishments">
                    <Select name="log" value={db.log ?? 'none'} onChange={handleChange}>
                      <option value='none'>None</option>
                      {
                        guild.c.map(x => <option key={x.id} value={x.id}>#{x.name}</option>)
                      }
                    </Select>
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
