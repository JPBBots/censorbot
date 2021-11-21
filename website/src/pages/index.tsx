import React from 'react'

import BRANDING from 'BRANDING'

import { LandingSection } from '~/landing/LandingSection'

import Aos from 'aos'
import 'aos/dist/aos.css'
import { LandingExample } from '~/landing/LandingExample'
import Router, { useRouter } from 'next/router'
import { HStack, VStack, Text, Button } from '@chakra-ui/react'
import { useMinWidth } from '@/hooks/useMinWidth'

import { Footer } from '@jpbbots/censorbot-components'

export default function Landing() {
  const router = useRouter()
  const [mobiled] = useMinWidth(1190)

  React.useEffect(() => {
    Aos.init({ duration: 400 })
    void Router.prefetch('/dashboard')
  }, [])

  return (
    <VStack margin={mobiled ? '30px 10px' : '30px 200px'}>
      <HStack gridGap="200px">
        <VStack
          maxW="500px"
          alignItems={mobiled ? 'center' : 'flex-start'}
          textAlign={mobiled ? 'center' : 'left'}
        >
          <Text fontSize="3rem">{BRANDING.title}</Text>
          <Text color="lighter.40" fontSize="1.4rem">
            {BRANDING.title2}
          </Text>
          <Button
            onClick={() => {
              void router.push('/dashboard')
            }}
          >
            Get Started
          </Button>

          <Text fontSize="0.7rem">
            Used in more than {(50000).toLocaleString()} servers!
          </Text>
        </VStack>

        {mobiled ? (
          ''
        ) : (
          <LandingExample example={BRANDING.mainImage} align="right" />
        )}
      </HStack>

      <VStack>
        {BRANDING.examples.map((x, ind) => (
          <div key={ind}>
            <LandingSection
              ind={ind}
              href="/"
              example={x.example}
              title={x.title}
              align={ind % 2 ? 'right' : 'left'}
            >
              {x.description}
            </LandingSection>
            <div
              style={{
                height: '50px'
              }}
            ></div>
          </div>
        ))}
      </VStack>

      <VStack
        data-aos="fade-up"
        data-aos-anchor-placement="top-bottom"
        textAlign="center"
      >
        <Text textStyle="heading.xl">Are you ready to go?</Text>
        <Text textStyle="heading.sm">Let's start cleaning your server!</Text>
        <Button
          onClick={() => {
            window.open('/invite', '_blank')
          }}
        >
          Invite
        </Button>
      </VStack>
      {new Array(5).fill(null).map((x, i) => (
        <br key={i} />
      ))}
      <Footer
        name="Censor Bot"
        companyName="JPBBots"
        copyrightYear="2017-2021"
        links={[
          {
            label: 'Contact Us',
            children: [
              {
                label: 'Discord Server',
                url: '/support'
              },
              {
                label: 'support@jpbbots.org',
                url: 'mailto:support@jpbbots.org'
              }
            ]
          },
          {
            label: 'Censor Bot',
            children: [
              {
                label: 'Invite',
                url: '/invite'
              },
              {
                label: 'Vote',
                url: '/vote'
              },
              {
                label: 'Review',
                url: '/review'
              }
            ]
          },
          {
            label: 'Important Links',
            children: [
              {
                label: 'Privacy Policy',
                url: '/privacy'
              },
              {
                label: 'Terms of Service',
                url: '/terms'
              },
              {
                label: 'Discord ToS',
                url: 'https://discord.com/terms'
              }
            ]
          }
        ]}
      />
      {new Array(2).fill(null).map((x, i) => (
        <br key={i} />
      ))}
    </VStack>
  )
}
