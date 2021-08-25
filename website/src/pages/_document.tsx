import { NextColorModeScript, NextFontHead } from '@jpbbots/censorbot-components'

import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

export default class Document extends NextDocument {
  render () {
    return (
      <Html lang="en">
        <Head>
          <NextFontHead/>
          <script src="https://js.chargebee.com/v2/chargebee.js"></script>
          {/* <script lang="javascript">{function () {
            if ('window' in global) {
              global.chargebee = Chargebee.init({
                site: 'censorbot-test'
              })
            }
          }}</script> */}
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
