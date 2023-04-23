import { useRouter } from 'next/router'

import { Api } from '@/structures/Api'
import { Utils } from '@/utils/Utils'
import { stats } from '@/structures/StatsManager'

import { useUser } from '@/hooks/useUser'

import { Header } from './Header'
import { NavActions } from './NavActions'
import { PageLink } from '~/link'

import { wMT } from '@jpbbots/theme'

import { MenuItem } from '@chakra-ui/menu'
import { Box } from '@chakra-ui/layout'

export function NavBar() {
  const { user, login, logout } = useUser(false)
  const showText = wMT(675)
  const showNavItems = wMT(475)
  const router = useRouter()

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
        title="Censor Bot"
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
              <PageLink href="/dashboard">
                <MenuItem>Dashboard</MenuItem>
              </PageLink>

              <PageLink href="/support">
                <MenuItem>Support</MenuItem>
              </PageLink>
            </>
          )}
          <PageLink href="/premium">
            <MenuItem>Premium</MenuItem>
          </PageLink>
          {user?.admin && (
            <PageLink href="/admin">
              <MenuItem>Admin</MenuItem>
            </PageLink>
          )}
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
