import { forwardRef } from 'react'

import { NavUserType } from './NavActions'

import { Box, Center, HStack } from '@chakra-ui/layout'
import { MenuButton, MenuButtonProps } from '@chakra-ui/menu'
import { Icon } from '@chakra-ui/icon'
import { Button } from '@chakra-ui/button'
import { Avatar } from '@chakra-ui/avatar'
import { FaChevronDown } from 'react-icons/fa'

type SlightlyCustomizedMenuButtonProps = MenuButtonProps & NavUserType

export interface AvatarDropdownActionProps
  extends SlightlyCustomizedMenuButtonProps {}

const activeState = {
  color: 'lighter.100',
  shadow: 'outline',
  '.hstack-avatar-insert': { bg: 'lighter.10' },
  '.hstack-avatar-outline': {
    shadow: 'outline'
  }
}

export const AvatarDropdownAction = forwardRef<
  HTMLButtonElement,
  AvatarDropdownActionProps
>(({ avatarUrl, ...menuButtonProps }, ref) => (
  <MenuButton
    as={Button}
    size="none"
    variant="none"
    h={8}
    p={0}
    bg="bg"
    zIndex={2}
    spacing={0}
    rounded="sm"
    ref={ref}
    color="lighter.60"
    position="relative"
    shadow="no-outline"
    transition="color .12s ease, box-shadow .12s ease"
    _hover={{
      color: 'lighter.100',
      '.hstack-avatar-insert': { bg: 'lighter.5' }
    }}
    _focus={activeState}
    _expanded={activeState}
    {...menuButtonProps}
  >
    <Box
      top={-2}
      left={4}
      zIndex={-2}
      boxSize={12}
      rounded="full"
      position="absolute"
      transition="box-shadow .12s ease"
      className="hstack-avatar-outline"
    />
    <Box bg="bg" inset={0} rounded="sm" position="absolute" zIndex={-1} />
    <HStack
      h={8}
      px={4}
      w="full"
      spacing={4}
      flexGrow={1}
      rounded="sm"
      className="hstack-avatar-insert"
      transition="background-color .12s ease"
    >
      <Avatar boxSize={12} src={avatarUrl} bg="bg" />
      <Center>
        <Icon boxSize={4} as={FaChevronDown} color="currentColor" />
      </Center>
    </HStack>
  </MenuButton>
))
