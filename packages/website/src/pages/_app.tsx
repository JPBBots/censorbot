import type { AppProps } from 'next/app'

import React from 'react'

import { NavBar } from '~/Navbar'
import { Header } from '~/Header'

import './Global.scss'

import { JPBProvider } from '@jpbbots/theme'

import { Provider } from 'react-redux'
import { store } from 'store'

import '../structures/Api'

import { Loader } from '~/Loader'
import { Flex } from '@chakra-ui/layout'

import { ChargebeeWeb } from 'types'
import { DefaultSeo } from 'next-seo'
import BRANDING from '@/BRANDING'

export const chargebee =
  'window' in global
    ? // @ts-expect-error
      (Chargebee?.init({ site: 'censorbot' }) as ChargebeeWeb) ?? null
    : null

export default function App(props: AppProps) {
  const { Component } = props

  return (
    <>
      <Header />
      <DefaultSeo
        title="Censor Bot"
        description="Advanced Anti-Swear Bot that comes with a pre-built filters, no work needed! anti swear bot"
        openGraph={{
          title: BRANDING.name,
          description:
            'Easy to use advanced content filtering for your Discord server(s)!'
        }}
      />
      <JPBProvider useCssReset useGlobalStyle>
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
      </JPBProvider>
    </>
  )
}
