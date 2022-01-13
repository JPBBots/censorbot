import { MenuItem } from '@chakra-ui/menu'
import { Box } from '@chakra-ui/layout'
import { Header, NavActions } from '@jpbbots/censorbot-components'
import { useHeadless, useUser } from 'hooks/useAuth'
import { useRouter } from 'next/router'
import { stats } from 'structures/StatsManager'

import { Api } from '@/structures/Api'
import { wMT } from '@/hooks/useScreenSize'

export function NavBar() {
  const [user, login, logout] = useUser(false)
  const showNavItems = wMT(675)
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
          textStyle: wMT(515) ? 'heading.xl' : 'label.md'
        }}
      >
        <NavActions
          actions={
            showNavItems
              ? [
                  {
                    label: 'Support'
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
                  avatarUrl: user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${
                        Number(user.tag.split('#')[1]) % 5
                      }.png`
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
              <MenuItem
                onClick={() => {
                  void router.push('/dashboard')
                }}
              >
                Dashboard
              </MenuItem>

              <MenuItem
                onClick={() => {
                  void router.push('/')
                }}
              >
                Support
              </MenuItem>
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
