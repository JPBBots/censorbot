import React, { useEffect, useState } from 'react'
import { Setting } from '~/settings/Setting'
import { settings } from '../../../components/settings/settings'

import { Select, HStack, VStack, Text, DeepPartial, Icon, Divider } from '@chakra-ui/react'
import { useGuild } from '@/hooks/useGuilds'
import { SettingSection } from '~/settings/SettingSection'
import { Exception, ExceptionType, GuildData } from 'typings/api'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { Section } from '@jpbbots/censorbot-components'



export default function Test () {
  const [guild] = useGuild()

  const [exceptions, setExceptions] = useState<Exception[]>([
    { role: '841483982243627009', channel: null, type: ExceptionType.Censor }
  ])

  useEffect(() => {
    console.log(exceptions)
  }, [exceptions])

  if (!guild) return <div>rmom</div>

  const { db } = guild
  return (
    <SettingSection section="Exceptions">
      <Section title="Exception">
      </Section>
    </SettingSection>
  )
}
