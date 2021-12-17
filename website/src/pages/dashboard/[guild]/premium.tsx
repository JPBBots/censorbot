import { useGuild } from '@/hooks/useGuilds'
import { HStack, Text, VStack } from '@chakra-ui/layout'
import { Setting } from '~/settings/Setting'
import { settings } from '~/settings/settings'
import { SettingSection } from '~/settings/SettingSection'

import Premium from '@/pages/premium'
import { PremiumIcon } from '~/PremiumIcon'
import { useUser } from '@/hooks/useAuth'
import { Switch } from '@chakra-ui/switch'
import { Tooltip } from '@chakra-ui/tooltip'
import { Api } from '@/structures/Api'
import { useDispatch } from 'react-redux'

import { current } from '@reduxjs/toolkit'

import { setUser } from '@/store/reducers/auth.reducer'

export default function GuildPremium() {
  const [guild] = useGuild()
  const [user] = useUser(true)
  const dispatch = useDispatch()

  return (
    <SettingSection section="Premium" disableSearch>
      <Text size="heading.xl">
        This server {guild?.premium ? 'has premium!' : 'does not have premium'}{' '}
        <PremiumIcon notColored={!guild?.premium} />
      </Text>
      {guild &&
        ((guild.premium && user?.premium?.guilds.includes(guild?.guild.id)) ||
          (!guild.premium && user?.premium?.count)) && (
          <VStack>
            <HStack>
              <Text>Enable premium</Text>
              <Switch
                onChange={({ target }) => {
                  let guilds = new Set(user.premium?.guilds)
                  if (target.checked) guilds.add(guild?.guild.id)
                  else guilds.delete(guild?.guild.id)
                  Api.ws
                    .request('SET_PREMIUM', {
                      guilds: [...guilds]
                    })
                    .then((val) => {
                      if (val === true) {
                        const premium = Object.assign({}, user.premium)
                        premium.guilds = [...guilds]

                        dispatch(setUser({ ...user, premium }))
                      }
                    })
                }}
                isChecked={guild.premium}
              />
            </HStack>
            <Tooltip
              label={`This will use 1 of your premium servers.
              You have ${
                user.premium.count - user.premium.guilds.length
              } premium
              servers remaining`}
            >
              ?
            </Tooltip>
          </VStack>
        )}
      {guild?.premium ? (
        settings
          .filter(
            (setting) =>
              setting.premium ??
              setting.options.some((x) => 'premium' in x && x.premium)
          )
          .map((x) => <Setting key={x.title ?? x.options[0].name} {...x} />)
      ) : (
        <HStack>
          <Premium />
        </HStack>
      )}
    </SettingSection>
  )
}
