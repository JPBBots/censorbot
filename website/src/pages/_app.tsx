import type { AppProps } from 'next/app'
import Router from 'next/router'

import React from 'react'

import Navbar from '~/navbar/Navbar'
import { Logo } from '~/logo'
import { Header } from '~/Header'

import { ApiData, DataContext, Api, LoggingInState } from '../structures/Api'

import './fix.css'

import './Global.scss'
import styles from './_app.module.scss'
import { Logger } from 'structures/Logger'

export const api = new Api()
global.api = api

export default class MyApp extends React.Component<AppProps, ApiData & { loading: boolean }> {
  state = {
    loggingIn: LoggingInState.Loading,
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
  }

  render () {
    return (
      <DataContext.Provider value={this.state}>
        <Header />
        <Navbar />
        <div className={styles.root} >
          <this.props.Component {...this.props.pageProps} />
        </div>
        <Logo className={styles.loader} style={{
          display: this.state.loading ? 'unset' : 'none'
        }} />
      </DataContext.Provider>
    )
  }
}
