import { MenuItem } from '@chakra-ui/menu'
import { Header, NavActions } from '@jpbbots/censorbot-components'
import { useUser } from 'hooks/useAuth'
import { useRouter } from 'next/router'
import { Box } from '@chakra-ui/react'
import { stats } from 'structures/StatsManager'
import { chargebee } from 'pages/_app'

export function NavBar () {
  const [user, login, logout] = useUser(false)
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
      <Header title="Censor Bot">
        <NavActions actions={[
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
        ]} user={user
          ? {
              avatarUrl: user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${Number(user.tag.split('#')[1]) % 5}.png`
            }
          : undefined} onLogin={() => login()}>
            {user?.premium?.customer && <MenuItem onClick={() => {
              if (chargebee) {
                chargebee.createChargebeePortal().open()
              }
            }}>
              Payment Portal
            </MenuItem>}
            <MenuItem onClick={() => {
              logout()
            }}>Logout</MenuItem>
          </NavActions>
      </Header>
    </Box>
  )
}
