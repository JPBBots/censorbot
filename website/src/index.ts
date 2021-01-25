import 'regenerator-runtime/runtime.js'
import * as smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

import { Loader } from './Loader'
import { Utils } from './structures/Utils'
import { Logger } from './structures/Logger'
import { E } from './structures/Elements'

import './typings/dom'
import './typings/api'

window.loadTime = 100

window.onload = async () => {
  if (new URLSearchParams(window.location.search).get('dev') === 'true') window.dev = true

  const loader = new Loader()
  window.__LOADER = loader

  if (window.dev) {
    Utils.addButton('Toast', () => Logger.tell('This is a test of the screen toast'))
    Utils.addButton('Present Load', () => {
      Utils.presentLoad(E.create({
        elm: 'div',
        text: 'This is a test of the Utils.presentLoad',
        children: [
          { elm: 'br' },
          {
            elm: 'button',
            classes: ['button'],
            events: {
              click: () => Utils.stopLoad()
            }
          }
        ]
      }) as HTMLElement)
    })
    Utils.addButton('Reload Page', () => Utils.reloadPage())
    const differentLogin = (type) => {
      return () => {
        window.discordOAuthExtra = type
        loader.api.auth()
      }
    }

    Utils.addButton('Normal Login', differentLogin(null))
    Utils.addButton('Login With Canary', differentLogin('/canary'))
    Utils.addButton('Login With PTB', differentLogin('/ptb'))

    Utils.addButton('Rebuild Site', () => {
      window.__LOADER.util.presentLoad('Rebuilding site')
      fetch('/', { method: 'DELETE' }).then(() => location.reload())
    }, true)

    Utils.addButton('Disable DEV mode', () => { window.location.search = '' })
  } else {
    (document.querySelector('nav > h3') as HTMLElement).oncontextmenu = (event) => {
      if (event.ctrlKey) {
        event.preventDefault()
        if (!confirm('This will enable development mode, are you sure? Press OK to continue.')) return
        window.location.search = '?dev=true'
      }
    }
  }
}