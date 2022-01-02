import type { AppProps } from 'next/app'

import React from 'react'

import { NavBar } from '~/navbar/Navbar'
import { Header } from '~/Header'

import './Global.scss'

import { CCProvider } from '@jpbbots/censorbot-components'

import { Provider } from 'react-redux'
import { store } from 'store'

import '../structures/Api'

import { Loader } from '~/Loader'
import { Flex } from '@chakra-ui/layout'

import { ChargebeeWeb } from 'types'

export const chargebee =
  'window' in global
    ? // @ts-expect-error
      (Chargebee?.init({ site: 'censorbot-test' }) as ChargebeeWeb) ?? null
    : null

export default function App(props: AppProps) {
  const { Component } = props

  return (
    <>
      <Header />
      <CCProvider useCssReset useGlobalStyle cookies={props.pageProps.cookies}>
        <Provider store={store}>
          <Flex
            h="full"
            flexDirection="column"
            minH="full"
            w="full"
            flexGrow={1}
          >
            <NavBar />
            <Component {...props.pageProps} />
          </Flex>
          <Loader />
        </Provider>
      </CCProvider>
    </>
  )
}
