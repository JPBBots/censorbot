import type { AppProps } from 'next/app'

import React from 'react'

import { NavBar } from '~/navbar/Navbar'
import { Header } from '~/Header'

import './fix.css'

import './Global.scss'
import styles from './_app.module.scss'
import { Logger } from 'structures/Logger'
import { stats } from 'structures/StatsManager'

import { CCProvider } from '@jpbbots/censorbot-components'
import '@yaireo/tagify/dist/tagify.css'

import { Provider } from 'react-redux'
import { store } from 'store'

import { Api } from '../structures/NewApi'

export default function App (props: AppProps) {
  const { Component } = props

  React.useEffect(() => {
    Api.ws.start()
  }, [])

  return (
    <CCProvider useCssReset useGlobalStyle cookies={props.pageProps.cookies}>
      <Provider store={store}>
        <Header />
        <NavBar />
        <div id="root" >
          <Component {...props.pageProps} />
        </div>
        {/* <Logo className={styles.loader} style={{
          display: this.state.loading ? 'unset' : 'none'
        }} /> */}
      </Provider>
    </CCProvider>
  )
}

// export function getServerSideProps ({ req }: any) {
//   return {
//     props: {
//       cookies: req.headers.cookie ?? ''
//     }
//   }
// }
