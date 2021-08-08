import type { AppProps } from 'next/app'

import React from 'react'

import { NavBar } from '~/navbar/Navbar'
import { Header } from '~/Header'

import './Global.scss'

import { CCProvider } from '@jpbbots/censorbot-components'
import '@yaireo/tagify/dist/tagify.css'

import { Provider } from 'react-redux'
import { store } from 'store'

import { Api } from '../structures/Api'
import { Loader } from '~/Loader'
import { Box, VStack } from '@chakra-ui/layout'

export default function App (props: AppProps) {
  const { Component } = props

  React.useEffect(() => {
    Api.ws.start()
  }, [])

  return (
    <CCProvider useCssReset useGlobalStyle cookies={props.pageProps.cookies}>
      <Provider store={store}>
        <Header />
        <VStack
          h="100%"
          minH="100%"
          w="100%"
          spacing={0}
        >
          <NavBar />
          <Box id="root" flexGrow={1} w="100%">
            <Box maxH="100%" h="100%">
              <Component {...props.pageProps} />
            </Box>
          </Box>
        </VStack>
        <Loader />
      </Provider>
    </CCProvider>
  )
}
