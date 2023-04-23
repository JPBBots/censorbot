import type { PropsWithChildren } from 'react'

import { CensorBotIcon } from '~/CensorBotIcon'

import { Box, HStack, StackProps, Text, TextProps } from '@chakra-ui/layout'

const ICON_SIZE = '40px'
export const HEADER_HEIGHT = '90px'

export interface HeaderProps extends PropsWithChildren<unknown> {
  title: string
  logoProps?: StackProps
  headerProps?: StackProps
  textProps?: TextProps
}

export const Header = ({
  title,
  headerProps,
  logoProps,
  children,
  textProps
}: HeaderProps) => (
  <HStack
    px={8}
    h={HEADER_HEIGHT}
    justify="space-between"
    w="full"
    flexShrink={0}
    flexGrow={0}
    {...(headerProps ?? {})}
  >
    <HStack spacing={4} {...(logoProps ?? {})}>
      <CensorBotIcon color="brand.100" boxSize={ICON_SIZE} />
      <Text
        as="h1"
        color="lighter.100"
        textStyle="heading.xl"
        {...(textProps ?? {})}
      >
        {title}
      </Text>
    </HStack>
    <Box>{children}</Box>
  </HStack>
)
