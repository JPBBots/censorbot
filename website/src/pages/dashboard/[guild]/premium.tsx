import { useGuild } from '@/hooks/useGuilds'
import { HStack, Text } from '@chakra-ui/layout'
import { Setting } from '~/settings/Setting'
import { settings } from '~/settings/settings'
import { SettingSection } from '~/settings/SettingSection'

import Premium from '@/pages/premium'
import { PremiumIcon } from '~/PremiumIcon'

export default function GuildPremium () {
  const [guild] = useGuild()

  return (
    <SettingSection section="Premium" disableSearch>
      <Text size="heading.xl">This server {guild?.premium ? 'has premium!' : 'does not have premium'} <PremiumIcon notColored={!guild?.premium} /></Text>
      {guild?.premium
        ? settings
          .filter(setting => setting.premium ?? setting.options.some(x => 'premium' in x && x.premium))
          .map(x => <Setting key={x.title ?? x.options[0].name} {...x} />)
        : <HStack>
          <Premium />
        </HStack>
      }
    </SettingSection>
  )
}
