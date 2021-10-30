import { Category, CategoryOption } from '@jpbbots/censorbot-components'
import { VStack, HStack, Icon, Divider, Text, Flex } from '@chakra-ui/react'

import Router from 'next/router'

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
} from 'react-icons/fa'
import { PremiumIcon } from '~/PremiumIcon'
import { useGuild } from 'hooks/useGuilds'
import { useWindowSize } from 'react-use'

export const CATEGORIES = {
  Filter: {
    icon: '',
  },
  General: {
    icon: '',
  },
  Other: {
    icon: '',
  },
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
    icon: <Icon as={FaCog} />,
  },
  {
    name: 'Exceptions',
    category: 'Filter',
    href: '/filter/exceptions',
    icon: <Icon as={FaFilter} />,
  },
  {
    name: 'Extras',
    category: 'Filter',
    href: '/filter/extras',
    icon: <Icon as={FaDiceD6} />,
  },
  {
    name: 'AI',
    category: 'Filter',
    href: '/filter/ai',
    icon: <Icon as={FaVial} />,
    premium: true,
  },

  {
    name: 'Punishments',
    category: 'General',
    href: '/general/punishments',
    icon: <Icon as={FaCommentSlash} />,
  },
  {
    name: 'Bot',
    category: 'General',
    href: '/general/bot',
    icon: <Icon as={FaRobot} />,
  },

  {
    name: 'Resend',
    category: 'Other',
    href: '/other/resend',
    icon: <Icon as={FaLocationArrow} />,
    premium: true,
  },
  {
    name: 'Response',
    category: 'Other',
    href: '/other/response',
    icon: <Icon as={FaComments} />,
    miniText: 'Popup',
  },
] as const

export type SectionName = typeof sections[number]['name']

interface SidebarOptions {
  selected?: string
  premium?: boolean
  opened: boolean
  onClose?: () => void
}

export function Sidebar({
  selected,
  premium,
  opened,
  ...props
}: SidebarOptions) {
  const [guild] = useGuild()
  const { height } = useWindowSize()

  return (
    <Flex
      backgroundColor="bg"
      data-back="a"
      position={opened ? 'unset' : 'unset'}
      h={height - 90}
      w={opened ? '96vw' : '308px'}
      zIndex={999}
    >
      <VStack backgroundColor="darker.20" padding={2} h="full">
        <VStack w={opened ? '96vw' : '308px'} spacing={2}>
          {guild && (
            <>
              <HStack w="full" justifyContent="center">
                <Text>{guild.guild.name}</Text>
                {opened && (
                  <Icon as={FaTimes} onClick={() => props.onClose?.()} />
                )}
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
                query: Router.query,
              })
            }}
          />
          <Divider color="lighter.5" />
          {Object.keys(CATEGORIES).map((category) => (
            <Category title={category} key={category}>
              {sections
                .filter((x) => x.category === category)
                .map((section) => (
                  <CategoryOption
                    key={section.href}
                    onClick={() => {
                      props.onClose?.()
                      void Router.push({
                        pathname: '/dashboard/[guild]' + section.href,
                        query: Router.query,
                      })
                    }}
                    icon={section.icon}
                    label={section.name}
                    isPremium={'premium' in section && section.premium}
                    isSelected={section.name === selected}
                  />
                ))}
            </Category>
          ))}
        </VStack>
      </VStack>
    </Flex>
  )
}
