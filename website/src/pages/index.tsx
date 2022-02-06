import { useEffect, useRef } from 'react'
import { Button, HStack, Image, Text, VStack, Box } from '@chakra-ui/react'

import DashboardExample from 'images/dashboardexample.png'
import PhoneDashboard from 'images/phonedashboard.png'
import DiscordChat from 'images/discordchat.png'

import { Lower, Upper } from '~/LandingSectionSvg'
import { PremiumIcon } from '~/PremiumIcon'

import { MiddleWrap } from '~/MiddleWrap'

import { uDW, wLT, wMT, TABLET_WIDTH } from '@/hooks/useScreenSize'
import { animate } from 'framer-motion'
import { useRouter } from 'next/router'
import { useServerCount } from '@/hooks/useMeta'
import { Root } from '~/Root'

const DESCRIPTION_FONT_SIZE = '24px'

export default function Landing() {
  const router = useRouter()

  const [serverCount] = useServerCount()

  const countRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (countRef) {
      const controls = animate(60000, serverCount, {
        duration: 1,
        onUpdate(value: number) {
          if (countRef.current)
            countRef.current.innerText = Number(
              value.toFixed(0)
            ).toLocaleString()
        }
      })

      return () => controls.stop()
    }
  }, [serverCount, countRef])

  const imageHeight = uDW({
    desktop: 281,
    tablet: 403,
    mobile: 175.14
  })

  const imageWidth = uDW({
    desktop: 509,
    tablet: 729,
    mobile: 315.63
  })

  const headingFontSize = uDW({
    desktop: '72px',
    tablet: '60px',
    mobile: '36px'
  })

  const alignCenter = wLT(TABLET_WIDTH)

  return (
    <Root pt={50}>
      <VStack justifyContent="center" alignItems="center" spacing={10} pb={50}>
        <VStack spacing="16px">
          <Text
            textStyle="heading.xl"
            fontSize={uDW({
              desktop: '96px',
              tablet: '72px',
              mobile: '36px'
            })}
            textAlign="center"
            color="brand.100"
          >
            Get started immediately
          </Text>
          <MiddleWrap
            spacing="15px"
            fontSize={uDW({
              desktop: '36px',
              tablet: '28px',
              mobile: '18px'
            })}
          >
            <Text textStyle="label.md" fontSize="inherit">
              No setup
            </Text>
            <Text textStyle="label.md" fontSize="inherit">
              No hassle
            </Text>
            <Text textStyle="label.md" fontSize="inherit">
              No headaches
            </Text>
          </MiddleWrap>
        </VStack>

        <HStack>
          <Button
            variant="primary"
            onClick={async () => await router.push('/dashboard')}
          >
            Invite Censor Bot
          </Button>
          <Button onClick={async () => await router.push('/dashboard')}>
            Dashboard
          </Button>
        </HStack>

        <VStack
          spacing={1}
          fontSize={uDW({
            tablet: '24px',
            mobile: '18px'
          })}
        >
          <Text textStyle="label.md" fontSize="inherit">
            Serving{' '}
            <Text
              textStyle="label.md"
              color="brand.100"
              fontSize="inherit"
              ref={countRef}
              as="span"
            >
              60,000
            </Text>{' '}
            communities on Discord
          </Text>
          <Text
            textStyle="label.md"
            textAlign="center"
            color="lighter.40"
            fontSize="inherit"
            p={uDW({ tablet: '0px', mobile: '16px' })}
          >
            The largest and most customizable anti-swear and filtering bot
          </Text>
        </VStack>

        <MiddleWrap spacing="25px" m={uDW({ tablet: '2px', mobile: '0px' })}>
          {wMT(TABLET_WIDTH) && (
            <Image
              src={DiscordChat.src}
              h={imageHeight}
              w={imageWidth}
              boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
              borderRadius={20}
            />
          )}
          <Image
            src={DashboardExample.src}
            h={imageHeight}
            w={imageWidth}
            boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
            borderRadius={20}
          />
        </MiddleWrap>
      </VStack>

      <VStack py="0px" w="full" spacing={0}>
        <Upper />
        <Box w="full" bg="brand.100">
          <MiddleWrap
            p={uDW({
              desktop: '0px 20px',
              tablet: '50px 20px',
              mobile: '32px 64px'
            })}
            spacing="100px"
          >
            <VStack
              textAlign={alignCenter ? 'center' : 'right'}
              alignItems={alignCenter ? 'center' : 'flex-end'}
              justifyContent="flex-end"
            >
              <Text textStyle="heading.xl" fontSize={headingFontSize}>
                #1 for Customization
              </Text>
              <Text
                textStyle="label.md"
                fontSize={DESCRIPTION_FONT_SIZE}
                maxW={707}
              >
                Easily customize Censor Bot to your needs, you can start with
                pre-made filters or make your own. Easily add filter exceptions
                or manage custom punishments!
              </Text>
              <Button
                bg="darker.80"
                _hover={{ bg: 'darker.100' }}
                onClick={async () => await router.push('/dashboard')}
              >
                Dashboard
              </Button>
            </VStack>

            {wMT(TABLET_WIDTH) && (
              <Box borderRadius={66}>
                <Image src={PhoneDashboard.src} w={452} h={686} />
              </Box>
            )}
          </MiddleWrap>
        </Box>
        <Lower />
      </VStack>

      <VStack py={100} w="full" spacing={0}>
        <MiddleWrap wrap="wrap-reverse" spacing="20px">
          <Image
            src={DashboardExample.src}
            h={imageHeight}
            width={imageWidth}
            boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
            borderRadius={20}
            flexGrow={0}
          />
          <VStack
            textAlign={alignCenter ? 'center' : 'left'}
            alignItems={alignCenter ? 'center' : 'flex-start'}
            justifyContent="flex-start"
            px="64px"
          >
            <Text textStyle="heading.xl" fontSize={headingFontSize}>
              What is Censor Bot
            </Text>
            <Text
              textStyle="label.md"
              fontSize={DESCRIPTION_FONT_SIZE}
              maxW={707}
            >
              Censor Bot is a simple, yet powerful anti-swear bot for your
              Discord server. It comes with pre-built filters managed by Censor
              Bot's curated staff team, keeping them up to date and accurate at
              all times.
            </Text>
            <Button>Read more</Button>
          </VStack>
        </MiddleWrap>
      </VStack>

      <VStack py={100} w="full" spacing={0} bg="darker.10">
        <MiddleWrap spacing="20px">
          <VStack
            textAlign={alignCenter ? 'center' : 'right'}
            alignItems={alignCenter ? 'center' : 'flex-end'}
            justifyContent="flex-end"
            px="64px"
          >
            <Text
              textStyle="heading.xl"
              fontSize={headingFontSize}
              color="brand.100"
            >
              Premium Features
            </Text>
            <Text
              textStyle="label.md"
              fontSize={DESCRIPTION_FONT_SIZE}
              maxW={707}
            >
              Can't get enough customization? Customize more with{' '}
              <PremiumIcon />{' '}
              <Text color="brand.100" as="span" fontSize="inherit">
                Censor Bot Premium
              </Text>
              . Gain access to increased filter limits, AI features, image
              filtering and more!
            </Text>
            <Button
              color="brand.100"
              onClick={async () => await router.push('/premium')}
            >
              Get Premium
            </Button>
          </VStack>
          <Image
            src={DashboardExample.src}
            h={imageHeight}
            width={imageWidth}
            boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
            borderRadius={20}
            flexGrow={0}
          />
        </MiddleWrap>
      </VStack>

      <VStack py={50} spacing={5}>
        <VStack textAlign="center" alignContent="center">
          <Text textStyle="heading.xl" fontSize={headingFontSize}>
            Get started now
          </Text>
          <Text
            maxW="33vw"
            minW="350px"
            textStyle="label.md"
            color="lighter.60"
            fontSize={DESCRIPTION_FONT_SIZE}
          >
            Simply invite the bot to get started. No additional setup is
            required. Easily add or change new or existing features through the
            dashboard at your own pace!
          </Text>
        </VStack>
        <MiddleWrap spacing="5px">
          <Button
            variant="primary"
            onClick={async () => await router.push('/dashboard')}
          >
            Get Started
          </Button>
        </MiddleWrap>
        <Text fontFamily="Kalam" color="lighter.60" fontSize={15}>
          Keeping your servers{' '}
          <Text color="brand.100" as="span">
            clean
          </Text>
          , since 2017
        </Text>
      </VStack>
    </Root>
  )
}
