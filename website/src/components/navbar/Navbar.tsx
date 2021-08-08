// import BRANDING from 'BRANDING'
// import Link from 'next/link'
// import styles from './Navbar.module.scss'

// import React from 'react'

// import { NavButton } from '~/button/NavButton'
// import { UserButton } from './UserButton'
// import { stats } from 'structures/StatsManager'

// export function NavBar () {
//   return (
//     <>
//       <div className={`${styles.nav}`}>
//         <div>
//           <div onContextMenu={((ev) => {
//             ev.preventDefault()
//             if (ev.altKey) {
//               stats.open()
//             }
//           })} className={styles.left}>
//             <Link href="/">
//               <h3>{BRANDING.name}</h3>
//             </Link>
//           </div>
//           <div className={styles.right}>
//             <NavButton target="_blank" href="/support">Support</NavButton>
//             <NavButton href="/dashboard">Dashboard</NavButton>
//             <UserButton />
//           </div>
//         </div>
//       </div>
//       {/* <div className={styles.formatter} style={{
//         height: `${this.ref.current?.offsetHeight}px`,
//         margin: 'auto',
//         padding: '2px'
//       }}>
//       </div> */}
//     </>
//   )
// }

import { HStack, VStack } from '@chakra-ui/layout'
import { MenuItem } from '@chakra-ui/menu'
import { Header, NavActions } from '@jpbbots/censorbot-components'
import { useUser } from 'hooks/useAuth'
import { useRouter } from 'next/router'

export function NavBar () {
  const [user, login, logout] = useUser(false)
  const router = useRouter()

  if ('window' in global) {
    window.router = router
  }

  return (
    <HStack
      justify="space-between"
      w="full"
      h="6vh"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="lighter.5">
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
            <MenuItem onClick={() => {
              logout()
            }}>Logout</MenuItem>
          </NavActions>
      </Header>
    </HStack>
  )
}
