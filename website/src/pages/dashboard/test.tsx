// import React, { useEffect, useState } from 'react'
// import { Setting } from '~/settings/Setting'
// import { settings } from '../../../components/settings/settings'

import { Text } from '@chakra-ui/layout'
import { InlineOptionGroup } from '@jpbbots/censorbot-components'
import { Selector } from '~/functional/Selector'

// import { Select, HStack, VStack, Text, DeepPartial, Icon, Divider } from '@chakra-ui/react'
// import { useGuild } from '@/hooks/useGuilds'
// import { SettingSection } from '~/settings/SettingSection'
// import { Exception, ExceptionType } from 'typings/api'
// import { Section } from '@jpbbots/censorbot-components'

export default function Test() {
  // const [guild] = useGuild()

  // const [exceptions, setExceptions] = useState<Exception[]>([
  //   { role: '841483982243627009', channel: null, type: ExceptionType.Everything }
  // ])

  // useEffect(() => {
  //   console.log(exceptions)
  // }, [exceptions])

  // if (!guild) return <div>rmom</div>

  // const { db } = guild
  // return (
  //   <SettingSection section="Exceptions">
  //     <Section title="Exception">
  //     </Section>
  //   </SettingSection>
  // )

  return (
    <InlineOptionGroup>
      <Text>Anyone with role</Text>
      <Selector
        role
        placeholder="Search @role"
        value="123123"
        onChange={() => {}}
      >
        {[
          {
            value: '123123',
            label: 'hello'
          },
          {
            value: '1231234',
            label: 'helloa'
          },
          {
            value: '1231235',
            label: 'hellob'
          }
        ]}
      </Selector>
      <Text>in channel</Text>
      <Selector
        channel
        placeholder="Search #channel"
        value="123123"
        onChange={() => {}}
      >
        {[
          {
            value: '123123',
            label: 'hello'
          },
          {
            value: '1231234',
            label: 'helloa'
          },
          {
            value: '1231235',
            label: 'hellob'
          }
        ]}
      </Selector>
    </InlineOptionGroup>
  )
}
