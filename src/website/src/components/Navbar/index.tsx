import { MenuItem } from '@chakra-ui/menu'
import { Box } from '@chakra-ui/layout'
import { useHeadless, useUser } from 'hooks/useAuth'
import { useRouter } from 'next/router'
import { stats } from 'structures/StatsManager'

import { Header } from './Header'
import { NavActions } from './NavActions'

import NextLink from 'next/link'

import { Api } from '@/structures/Api'
import { wMT } from '@jpbbots/theme'
import { Utils } from '@/utils/Utils'

export function NavBar() {
  const { user, login, logout } = useUser(false)
  const showText = wMT(675)
  const showNavItems = wMT(475)
  const router = useRouter()
  const [headless] = useHeadless()

  return (
    <Box
      w="full"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="lighter.5"
      onContextMenu={(ev) => {
        if (ev.altKey) stats.open()
      }}
    >
      <Header
        title={headless ? 'Headless Bot' : 'Censor Bot'}
        logoProps={{
          onClick: () => {
            void router.push('/')
          },
          cursor: 'pointer'
        }}
        textProps={{
          display: showText ? undefined : 'none',
          textStyle: wMT(515) ? 'heading.xl' : 'label.md'
        }}
      >
        <NavActions
          actions={
            showNavItems
              ? [
                  {
                    label: 'Support',
                    onClick: () => {
                      void window.open('/support', '_blank')
                    }
                  },
                  {
                    label: 'Dashboard',
                    isActive: router.pathname === '/dashboard',
                    onClick: () => {
                      void router.push('/dashboard')
                    }
                  }
                ]
              : []
          }
          user={
            user
              ? {
                  avatarUrl: Utils.getUserAvatar(user)
                }
              : undefined
          }
          onLogin={() => login()}
        >
          {user?.premium?.customer && (
            <MenuItem
              onClick={() => {
                void Api.createPortal()
              }}
            >
              Payment Portal
            </MenuItem>
          )}
          {!showNavItems && (
            <>
              <NextLink href="/dashboard" passHref>
                <MenuItem onClick={() => {}}>Dashboard</MenuItem>
              </NextLink>

              <NextLink href="/support" passHref>
                <MenuItem onClick={() => {}}>Support</MenuItem>
              </NextLink>
            </>
          )}
          <MenuItem onClick={() => void router.push('/premium')}>
            Premium
          </MenuItem>
          <MenuItem
            onClick={() => {
              logout()
            }}
          >
            Logout
          </MenuItem>
        </NavActions>
      </Header>
    </Box>
  )
}
