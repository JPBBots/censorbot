import type { FunctionComponent, PropsWithChildren } from 'react'
import type { StackProps } from '@chakra-ui/react'
import {
  Box,
  Button,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuList
} from '@chakra-ui/react'
import { AvatarDropdownAction } from './AvatarDropdownAction'

export interface NavUserType {
  avatarUrl: string
}

export interface NavActionType {
  label: string
  href?: string
  isActive?: boolean
  onClick?: () => void
}

export interface NavActionsProps
  extends PropsWithChildren<Omit<StackProps, 'children'>> {
  actions: NavActionType[]
  user?: NavUserType
  onLogin?: () => void
  onUserClick?: () => void
  customAsLink?: FunctionComponent
}

export const NavActions = ({
  actions,
  user,
  onLogin = () => {},
  customAsLink,
  children,
  ...stackProps
}: NavActionsProps) => (
  <HStack spacing={4} {...stackProps}>
    <HStack spacing={2}>
      {actions.map((action, i) => {
        const withLinkProps = action.href
          ? { as: customAsLink ?? Link, href: action.href }
          : {}
        return (
          <Button
            key={i}
            size="none"
            variant="none"
            {...withLinkProps}
            textStyle="label.md"
            onClick={action.onClick ?? (() => {})}
            color="lighter.60"
          >
            {action.label}
          </Button>
        )
      })}
      {!user && (
        <Box pl={2}>
          <Button variant="primary" size="sm" onClick={onLogin}>
            Login
          </Button>
        </Box>
      )}
    </HStack>
    {user && (
      <Menu gutter={16}>
        <MenuButton as={AvatarDropdownAction} {...user} />
        <MenuList>{children}</MenuList>
      </Menu>
    )}
  </HStack>
)
