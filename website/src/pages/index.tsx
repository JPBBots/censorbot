import { useEffect, useRef } from 'react'
import { Button, Image, Text, VStack, Box } from '@chakra-ui/react'

import DashboardExample from 'images/dashboardexample.png'
import PhoneDashboard from 'images/phonedashboard.png'
import DiscordChat from 'images/discordchat.png'

import { Lower, Upper } from '~/LandingSectionSvg'
import { PremiumIcon } from '~/PremiumIcon'

import NextLink from 'next/link'

import { wLT, wMT, TABLET_WIDTH, MiddleWrap } from '@jpbbots/theme'
import { animate } from 'framer-motion'
import { useServerCount } from '@/hooks/useMeta'
import { Root } from '~/Root'

const DESCRIPTION_FONT_SIZE = '24px'

const imageWidth = {
  desktop: '509px',
  tablet: '729px',
  mobile: '315.63px'
}

const imageHeight = {
  desktop: '281px',
  tablet: '403px',
  mobile: '175.14px'
}

const headingFontSize = {
  desktop: '72px',
  tablet: '60px',
  mobile: '36px'
}

export default function Landing() {
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

  const alignCenter = wLT(TABLET_WIDTH)

  return (
    <Root>
      <VStack pt={50} w="full">
        <VStack
          justifyContent="center"
          alignItems="center"
          spacing={10}
          pb={50}
        >
          <VStack spacing="16px">
            <Text
              textStyle="heading.xl"
              fontSize={{
                desktop: '96px',
                tablet: '72px',
                mobile: '36px'
              }}
              textAlign="center"
              color="brand.100"
            >
              Get started immediately
            </Text>
            <MiddleWrap
              spacing="15px"
              fontSize={{
                desktop: '36px',
                tablet: '28px',
                mobile: '18px'
              }}
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

          <MiddleWrap spacing="10px 32px">
            <NextLink href="/dashboard" passHref>
              <Button w="230px" variant="brand" onClick={() => {}}>
                Invite Censor Bot
              </Button>
            </NextLink>

            <NextLink href="/dashboard" passHref>
              <Button w="200px" onClick={() => {}}>
                Dashboard
              </Button>
            </NextLink>
          </MiddleWrap>

          <VStack
            spacing={1}
            fontSize={{
              tablet: '24px',
              mobile: '18px'
            }}
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
              p={{ tablet: '0px', mobile: '16px' }}
            >
              The largest and most customizable anti-swear and filtering bot
            </Text>
          </VStack>

          <MiddleWrap spacing="25px" m={{ tablet: '2px', mobile: '0px' }}>
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
              p={{
                desktop: '0px 20px',
                tablet: '50px 20px',
                mobile: '32px 64px'
              }}
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
                  pre-made filters or make your own. Easily add filter
                  exceptions or manage custom punishments!
                </Text>
                <NextLink href="/dashboard" passHref>
                  <Button w="200px" variant="dark">
                    Dashboard
                  </Button>
                </NextLink>
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
                Discord server. It comes with pre-built filters managed by
                Censor Bot's curated staff team, keeping them up to date and
                accurate at all times.
              </Text>
              <Button w="200px">Read more</Button>
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
                maxW="707px"
              >
                Can't get enough customization? Customize more with{' '}
                <PremiumIcon />{' '}
                <Text color="brand.100" as="span" fontSize="inherit">
                  Censor Bot Premium
                </Text>
                . Gain access to increased filter limits, AI features, image
                filtering and more!
              </Text>
              <NextLink href="/premium" passHref>
                <Button color="brand.100" onClick={() => {}}>
                  Get Premium
                </Button>
              </NextLink>
            </VStack>
            <Image
              src={DashboardExample.src}
              h={imageHeight}
              width={imageWidth}
              boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
              borderRadius="20px"
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
              required. Easily add or change new or existing features through
              the dashboard at your own pace!
            </Text>
          </VStack>
          <MiddleWrap spacing="5px">
            <NextLink href="/dashboard" passHref>
              <Button w="230px" variant="brand" onClick={() => {}}>
                Get Started
              </Button>
            </NextLink>
          </MiddleWrap>
          <Text fontFamily="Kalam" color="lighter.60" fontSize={15}>
            Keeping your servers{' '}
            <Text color="brand.100" as="span">
              clean
            </Text>
            , since 2017
          </Text>
        </VStack>
      </VStack>
    </Root>
  )
}
