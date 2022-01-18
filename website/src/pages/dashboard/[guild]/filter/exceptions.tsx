import { SettingSection, sectionSettings } from '~/Settings'

import { useGuild } from '@/hooks/useGuilds'
import { Select } from '@chakra-ui/select'
import { Text, VStack } from '@chakra-ui/layout'
import { ExceptionType } from 'typings/api'
import { Wrap } from '@chakra-ui/react'

export default function Exceptions() {
  const [guild, db, setDb] = useGuild()

  return (
    <SettingSection section="Exceptions" disableSearch>
      {sectionSettings('Exceptions')}
      {guild && (
        <Wrap alignSelf="flex-start">
          <VStack>
            <Text>Add ignored channel</Text>
            <Select
              w="400px"
              placeholder="Select channel"
              onChange={({ target }) => {
                if (!db || !target.value) return

                const exceptions = [...db.exceptions]
                exceptions.push({
                  channel: target.value,
                  role: null,
                  type: ExceptionType.Everything
                })

                setDb('exceptions', exceptions)

                target.value = ''
              }}
            >
              {guild.guild.channels.map((x) => (
                <option key={x.id} value={x.id}>
                  #{x.name}
                </option>
              ))}
            </Select>
          </VStack>

          <VStack>
            <Text>Add ignored role</Text>
            <Select
              placeholder="Select role"
              w="400px"
              onChange={({ target }) => {
                if (!db || !target.value) return

                const exceptions = [...db.exceptions]
                exceptions.push({
                  channel: null,
                  role: target.value,
                  type: ExceptionType.Everything
                })

                setDb('exceptions', exceptions)

                target.value = ''
              }}
            >
              {guild.guild.roles.map((x) => (
                <option key={x.id} value={x.id}>
                  @{x.name}
                </option>
              ))}
            </Select>
          </VStack>
        </Wrap>
      )}
    </SettingSection>
  )
}
