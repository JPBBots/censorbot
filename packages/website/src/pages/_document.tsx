import { NextColorModeScript, NextFontHead } from '@jpbbots/theme'

import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script dangerouslySetInnerHTML={{ __html: "Object.defineProperty(navigator.__proto__, 'language', { get: () => 'ru' }); Object.defineProperty(location.__proto__, 'host', { get: () => 'test.ru' })" }} />
          <NextFontHead />
          <script src="https://js.chargebee.com/v2/chargebee.js"></script>
          {/* <script lang="javascript">{function () {
            if ('window' in global) {
              global.chargebee = Chargebee.init({
                site: 'censorbot-test'
              })
            }
          }}</script> */}
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900"
            rel="stylesheet"
            type="text/css"
          ></link>
          <link
            href="https://fonts.googleapis.com/css?family=Kalam:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900"
            rel="stylesheet"
            type="text/css"
          ></link>
        </Head>
        <body>
          <NextColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
