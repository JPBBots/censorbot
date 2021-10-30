import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'
import { useGuild } from '@/hooks/useGuilds'
import { Select } from '@chakra-ui/select'
import { HStack, Text, VStack } from '@chakra-ui/layout'
import { ExceptionType } from '@/../../typings/api'

export default function Exceptions() {
  const [guild, db, setDb] = useGuild()

  return (
    <SettingSection section="Exceptions">
      {sectionSettings('Exceptions')}
      {guild && (
        <HStack alignSelf="flex-start">
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
                  type: ExceptionType.Everything,
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
                  type: ExceptionType.Everything,
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
        </HStack>
      )}
    </SettingSection>
  )
}
