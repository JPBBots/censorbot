import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack } from '@chakra-ui/react'
import { api } from 'pages/_app'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'
import { Option } from '~/functional/Option'

import { SettingSection } from '~/SettingSection'

export default function Ai () {
  return (
    <SettingSection section="AI">
      {
        (db) => (
          <Formik initialValues={{
            toxicity: db.toxicity,
            ocr: db.ocr,
            images: db.images
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
                  <Section title="Toxicity Filter">
                    <Option name="toxicity" isChecked={db.toxicity} onChange={handleChange} label="Filter out toxic messages with AI" isPremium />
                  </Section>
                  <Section title="Anti-NSFW Images">
                    <Option name="images" isChecked={db.images} onChange={handleChange} label="Improve Discord’s built-in image moderation with a more agressive AI" isPremium />
                  </Section>
                  <Section title="OCR - Optical Character Recognition">
                    <Option name="ocr" isChecked={db.ocr} onChange={handleChange} label="Scan and filter images with text" isPremium />
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
