import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack } from '@chakra-ui/react'
import { api } from 'pages/_app'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'
import { Option } from '~/functional/Option'

import { SettingSection } from '~/SettingSection'

export default function Filter () {
  return (
    <SettingSection section="Extras">
      {
        (db) => (
          <Formik initialValues={{
            invites: db.invites,
            multi: db.multi,
            nsfw: db.nsfw,
            antiHoist: db.antiHoist
          }} onSubmit={(value, helpers) => {
            console.log(value)

            const old = { ...db }

            if (!api.data.currentGuild) return
            api.setData({ currentGuild: api._createUpdatedGuild(api.data.currentGuild, value) })

            void api.changeSettings(Router.query.guild as Snowflake, value).catch(() => {
              if (!api.data.currentGuild) return

              api.setData({ currentGuild: api._createUpdatedGuild(api.data.currentGuild, old) })
              for (const key in value) {
                value[key as keyof typeof value] = api.data.currentGuild.db[key as keyof typeof value]
              }
              helpers.setValues(value)
            })
          }}>
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
