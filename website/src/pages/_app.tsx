import type { AppProps } from 'next/app'
import Router from 'next/router'

import React from 'react'

import Navbar from '~/navbar/Navbar'
import { Logo } from '~/logo'
import { Header } from '~/Header'

import { ApiData, DataContext, Api, LoginState } from '../structures/Api'

import './fix.css'

import './Global.scss'
import styles from './_app.module.scss'
import { Logger } from 'structures/Logger'
import { stats } from 'structures/StatsManager'

import { CCProvider } from '@jpbbots/censorbot-components'
import '@yaireo/tagify/dist/tagify.css'

export const api = new Api()
global.api = api

export default class MyApp extends React.Component<AppProps, ApiData & { loading: boolean }> {
  state = {
    login: LoginState.Loading,
    loading: true
  }

  componentDidMount () {
    api.ws.start()

    Object.defineProperty(api, 'data', {
      get: () => {
        return this.state
      },
      configurable: true
    })

    api.setData = (data) => {
      this.setState({ ...api.data, ...data })
    }

    Logger.setLoading = (loading) => {
      this.setState({ loading })
    }

    Router.events.on('routeChangeStart', () => {
      this.setState({ loading: true })
    })
    Router.events.on('routeChangeComplete', () => {
      this.setState({ loading: false })
    })

    window.onbeforeunload = () => {
      stats.win?.close()
    }
  }

  render () {
    return (
      <CCProvider useCssReset useGlobalStyle cookies={this.props.pageProps.cookies}>
        <DataContext.Provider value={this.state}>
          <Header />
          <Navbar />
          <div id="root" >
            <this.props.Component {...this.props.pageProps} data={this.state} />
          </div>
          <Logo className={styles.loader} style={{
            display: this.state.loading ? 'unset' : 'none'
          }} />
        </DataContext.Provider>
      </CCProvider>
    )
  }
}

export function getServerSideProps ({ req }: any) {
  return {
    props: {
      cookies: req.headers.cookie ?? ''
    }
  }
}
