import { useGuild } from '@/hooks/useGuilds'
import { HStack, Text, VStack } from '@chakra-ui/layout'

import { Setting, settings, DashboardSection } from '~/Settings'

import { PremiumIcon } from '~/PremiumIcon'
import { useUser } from '@/hooks/useAuth'
import { Switch } from '@chakra-ui/switch'
import { Api } from '@/structures/Api'
import { useDispatch } from 'react-redux'

import { setUser } from '@/store/reducers/auth.reducer'
import { BuyPremium } from '~/BuyPremium'
import { Help } from '@jpbbots/theme'

export default function GuildPremium() {
  const { currentGuild: guild } = useGuild()
  const { user } = useUser(true)
  const dispatch = useDispatch()

  return (
    <DashboardSection section="Premium" disableSearch>
      <VStack alignSelf="flex-start" align="flex-start">
        <Text size="heading.xl">
          This server{' '}
          {guild?.premium ? 'has premium!' : 'does not have premium'}{' '}
          <PremiumIcon notColored={!guild?.premium} />
        </Text>
        {guild &&
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          ((guild.premium && user?.premium?.guilds.includes(guild?.guild.id)) ||
            (!guild.premium && user?.premium?.count)) && (
            <HStack>
              <Text>Enable premium</Text>
              <Switch
                onChange={({ target }) => {
                  const guilds = new Set(user.premium?.guilds)
                  if (target.checked) guilds.add(guild?.guild.id)
                  else guilds.delete(guild?.guild.id)
                  void Api.ws
                    .request('SET_PREMIUM', {
                      guilds: [...guilds]
                    })
                    .then((val) => {
                      if (val) {
                        const premium = Object.assign({}, user.premium)
                        premium.guilds = [...guilds]

                        dispatch(setUser({ ...user, premium }))
                      }
                    })
                }}
                isChecked={guild.premium}
              />
              <Help>
                {`This will use 1 of your premium servers. You have
                ${user.premium.count - user.premium.guilds.length} premium
                servers remaining`}
              </Help>
            </HStack>
          )}
      </VStack>
      {guild?.premium
        ? settings
            .filter(
              (setting) =>
                setting.premium ??
                setting.options.some((x) => 'premium' in x && x.premium)
            )
            .map((x) => <Setting key={x.title ?? x.options[0].name} {...x} />)
        : !user?.premium?.count && (
            <HStack>
              <BuyPremium />
            </HStack>
          )}
    </DashboardSection>
  )
}
