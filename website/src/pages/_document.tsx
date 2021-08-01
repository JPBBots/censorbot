import { NextColorModeScript, NextFontHead } from '@jpbbots/censorbot-components'

import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

export default class Document extends NextDocument {
  render () {
    return (
      <Html lang="en">
        <Head>
          <NextFontHead/>
        </Head>
        <body>
          <NextColorModeScript/>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
