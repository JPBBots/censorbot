import Router from 'next/router'

import { useGuild } from '@/hooks/useGuild'
import { useWindowSize } from 'react-use'

import { PremiumIcon } from '~/PremiumIcon'
import { CategoryOption } from './category/CategoryOption'
import { Category } from './category/Category'
import { PageLink } from '~/link'

import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input'
import { VStack, HStack, Divider, Text, Flex } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/icon'
import { Image } from '@chakra-ui/image'
import { Button } from '@chakra-ui/button'
import {
  FaCog,
  FaFilter,
  FaDiceD6,
  FaVial,
  FaCommentSlash,
  FaRobot,
  FaLocationArrow,
  FaComments,
  FaTimes,
  FaSearch
} from 'react-icons/fa'

export const CATEGORIES = {
  Filter: {
    icon: ''
  },
  General: {
    icon: ''
  },
  Other: {
    icon: ''
  }
}

// interface Section {
//   name: string
//   href?: string
//   icon?: string
//   premium?: boolean
//   miniText?: string
//   category: keyof typeof CATEGORIES
//   sections?: Section[]
// }

export const sections = [
  {
    name: 'General',
    category: 'Filter',
    href: '/filter',
    icon: <Icon as={FaCog} />
  },
  {
    name: 'Extras',
    category: 'Filter',
    href: '/filter/extras',
    icon: <Icon as={FaDiceD6} />
  },
  {
    name: 'AI',
    category: 'Filter',
    href: '/filter/ai',
    icon: <Icon as={FaVial} />,
    premium: true
  },
  {
    name: 'Exceptions',
    category: 'Filter',
    href: '/filter/exceptions',
    icon: <Icon as={FaFilter} />
  },

  {
    name: 'Punishments',
    category: 'General',
    href: '/general/punishments',
    icon: <Icon as={FaCommentSlash} />
  },
  {
    name: 'Bot',
    category: 'General',
    href: '/general/bot',
    icon: <Icon as={FaRobot} />
  },

  {
    name: 'Resend',
    category: 'Other',
    href: '/other/resend',
    icon: <Icon as={FaLocationArrow} />,
    premium: true
  },
  {
    name: 'Response',
    category: 'Other',
    href: '/other/response',
    icon: <Icon as={FaComments} />,
    miniText: 'Popup'
  }
] as const

export type SectionName = (typeof sections)[number]['name']

interface AsideOptions {
  selected?: string
  premium?: boolean
  opened: boolean
  mobiled: boolean
  onClose?: () => void
  onSearchOpen: () => void
}

export function Aside({
  selected,
  premium,
  opened,
  mobiled,
  ...props
}: AsideOptions) {
  const { currentGuild: guild } = useGuild()
  const { height } = useWindowSize()

  return (
    <Flex
      h={height - 90}
      zIndex={999}
      transition="0.5s"
      w={mobiled ? (opened ? 'full' : '0px') : undefined}
      backgroundColor="darker.20"
    >
      <Flex overflowY="scroll" overflowX="hidden">
        <VStack padding={2} h="fit-content">
          <VStack w={opened ? '95vw' : '308px'} spacing={2}>
            {guild && (
              <>
                <HStack w="full" padding="1px 20px">
                  {opened && (
                    <Icon
                      cursor="pointer"
                      fontSize="30px"
                      display="inline-flex"
                      fill="lighter.20"
                      as={FaTimes}
                      onClick={() => props.onClose?.()}
                    />
                  )}
                  <HStack
                    w="full"
                    minH="50px"
                    justifyContent="center"
                    bg="darker.20"
                    borderRadius="10px"
                    as={Button}
                  >
                    {guild.guild.icon && (
                      <Image
                        w="50px"
                        h="50px"
                        src={`https://cdn.discordapp.com/icons/${guild.guild.id}/${guild.guild.icon}.png`}
                      />
                    )}
                    <Text>{guild.guild.name}</Text>
                  </HStack>
                </HStack>
                <Divider color="lighter.5" />
              </>
            )}
            <CategoryOption
              icon={<PremiumIcon />}
              label="Premium"
              isSelected={premium}
              onClick={() => {
                props.onClose?.()
                void Router.push({
                  pathname: '/dashboard/[guild]/premium',
                  query: Router.query
                })
              }}
            />
            <Divider color="lighter.5" />
            {opened && (
              <HStack
                _focus={{
                  transition: '0.5s'
                }}
                justifyContent="flex-end"
                w="full"
              >
                <InputGroup transition="0.4s" w="full">
                  <InputLeftAddon>
                    <Icon fill="brand.100" as={FaSearch} />
                  </InputLeftAddon>

                  <Input
                    placeholder="Search settings..."
                    onFocus={() => {
                      props.onSearchOpen()
                    }}
                  />
                </InputGroup>
              </HStack>
            )}
            {Object.keys(CATEGORIES).map((category) => (
              <Category title={category} key={category}>
                {sections
                  .filter((x) => x.category === category)
                  .map((section) => (
                    <PageLink
                      key={section.href}
                      href={`/dashboard/${Router.query.guild}${section.href}`}
                      w="full"
                    >
                      <CategoryOption
                        onClick={() => {
                          props.onClose?.()
                          // void Router.push({
                          //   pathname: '/dashboard/[guild]' + section.href,
                          //   query: Router.query
                          // })
                        }}
                        icon={section.icon}
                        label={section.name}
                        isPremium={'premium' in section && section.premium}
                        isSelected={section.name === selected}
                      />
                    </PageLink>
                  ))}
              </Category>
            ))}
          </VStack>
        </VStack>
      </Flex>
    </Flex>
  )
}
