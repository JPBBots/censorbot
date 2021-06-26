import type { AppProps } from 'next/app'
import Router from 'next/router'

import React from 'react'

import Navbar from '~/navbar/Navbar'
import { Logo } from '~/logo'
import { Header } from '~/Header'

import { ApiData, DataContext, Api } from '../structures/Api'

import './Global.scss'
import styles from './_app.module.scss'

export const api = new Api()
global.api = api

api.ws.start()

export default function MyApp ({ Component, pageProps }: AppProps) {
  const [data, setData] = React.useState({} as ApiData)

  Object.defineProperty(api, 'data', {
    get: () => {
      return data
    },
    configurable: true
  })

  api.setData = (data) => {
    setData(data)
  }

  const [loading, setLoading] = React.useState(false)

  Router.events.on('routeChangeStart', () => {
    setLoading(true)
  })
  Router.events.on('routeChangeComplete', () => {
    setLoading(false)
  })

  return (
    <DataContext.Provider value={ data }>
      <Header />
      <Navbar />
      <div className={styles.root} >
        <Component {...pageProps} />
      </div>
      <Logo className={styles.loader} style={{
        display: loading ? 'unset' : 'none'
      }}/>
    </DataContext.Provider>
  )
}
