import type { AppProps } from 'next/app'

import React from 'react'

import { NavBar } from '~/navbar/Navbar'
import { Header } from '~/Header'

import './Global.scss'

import { CCProvider, PageWrapper } from '@jpbbots/censorbot-components'
import '@yaireo/tagify/dist/tagify.css'

import { Provider } from 'react-redux'
import { store } from 'store'

import { Api } from '../structures/Api'
import { Loader } from '~/Loader'

export default function App (props: AppProps) {
  const { Component } = props

  React.useEffect(() => {
    Api.ws.start()
  }, [])

  return (
    <>
      <Header />
      <CCProvider useCssReset useGlobalStyle cookies={props.pageProps.cookies}>
        <Provider store={store}>
          <PageWrapper header={<NavBar />}>
            <Component {...props.pageProps} />
          </PageWrapper>
          <Loader />
        </Provider>
      </CCProvider>
    </>
  )
}
