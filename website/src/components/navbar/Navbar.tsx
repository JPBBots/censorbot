import BRANDING from 'BRANDING'
import Link from 'next/link'
import styles from './Navbar.module.scss'

import React from 'react'

import { NavButton } from '~/button/NavButton'
import { UserButton } from './UserButton'
import { stats } from 'structures/StatsManager'

export default class Navbar extends React.Component<unknown, { sticky: boolean }> {
  state = {
    sticky: false
  }

  ref = React.createRef<HTMLDivElement>()

  componentDidMount () {
    // window.addEventListener('scroll', () => {
    //   if (global.scrollY < 2) this.setState({ sticky: false })
    //   else this.setState({ sticky: true })
    // })
  }

  render () {
    return (
      <>
        <div ref={this.ref} className={`${styles.nav}${this.state.sticky ? ` ${styles.sticky}` : ''}`}>
          <div>
            <div onContextMenu={((ev) => {
              ev.preventDefault()
              if (ev.altKey) {
                stats.open()
              }
            })} className={styles.left}>
              <Link href="/">
                <h3>{BRANDING.name}</h3>
              </Link>
            </div>
            <div className={styles.right}>
              <NavButton target="_blank" href="/support">Support</NavButton>
              <NavButton href="/dashboard">Dashboard</NavButton>
              <UserButton />
            </div>
          </div>
        </div>
        {/* <div className={styles.formatter} style={{
          height: `${this.ref.current?.offsetHeight}px`,
          margin: 'auto',
          padding: '2px'
        }}>
        </div> */}
      </>
    )
  }
}
