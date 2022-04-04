import { useGuild } from '@/hooks/useGuilds'
import { HStack, Text, VStack } from '@chakra-ui/layout'

import { Setting, settings, DashboardSection } from '~/Settings'

import { PremiumIcon } from '~/PremiumIcon'
import { useUser } from '@/hooks/useAuth'
import { Switch } from '@chakra-ui/switch'
import { Api } from '@/structures/Api'
import { useDispatch } from 'react-redux'

import { setUser } from '@/store/reducers/auth.reducer'
import { Help } from '@jpbbots/theme'

import Countdown from 'react-countdown'

import Premium from 'pages/premium'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import { useRef } from 'react'

export default function GuildPremium() {
  const { currentGuild: guild } = useGuild()
  const { user } = useUser(true)
  const dispatch = useDispatch()

  const trialDisclosure = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <DashboardSection section="Premium" disableSearch>
      <VStack alignSelf="flex-start" align="flex-start">
        <Text size="heading.xl">
          This server{' '}
          {guild?.premium ? 'has premium!' : 'does not have premium'}{' '}
          <PremiumIcon notColored={!guild?.premium} />
        </Text>
        {guild?.trial && guild.premium && (
          <Text size="heading.xl">
            Trial expires in <Countdown date={guild.trial} />
          </Text>
        )}
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
              <Premium
                hideFooter
                trialText={
                  guild?.trial
                    ? 'Already used trial!'
                    : user?.premium?.trial
                    ? "You're already using a trial!"
                    : undefined
                }
                onTrial={trialDisclosure.onOpen}
              />
            </HStack>
          )}
      <AlertDialog
        isOpen={trialDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={trialDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              <PremiumIcon /> Activate Premium Trial?
            </AlertDialogHeader>

            <AlertDialogBody>
              You can only active a trial on a server once, and can only
              activate 1 trial at a time. Are you sure you want to activate your
              trial on{' '}
              <Text as="span" fontWeight="bold">
                {guild?.guild.name}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={trialDisclosure.onClose}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  void Api.ws.request('ENABLE_TRIAL', guild?.guild.id!)
                  trialDisclosure.onClose()
                }}
                color="white"
                ml={3}
              >
                Enable Trial
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </DashboardSection>
  )
}
