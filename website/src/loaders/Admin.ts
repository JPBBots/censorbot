import { Loader } from '../Loader'
import { Utils } from '../structures/Utils'
import { Logger } from '../structures/Logger'
import { E } from '../structures/Elements'

export function Admin (loader: Loader) {
  if (window.dev) {
    window.onerror = (err) => {
      alert(err)
    }
    console.error = (msg) => alert(msg)

    document.getElementById('connection').oncontextmenu = (e) => {
      e.preventDefault()

      Logger.tell('mgam')
    }

    const devElm = document.getElementById('devcommands')

    devElm.removeAttribute('hidden')

    const addButton = (name: string, fn: () => void, admin: boolean = false) => {
      const button = document.createElement('button')

      button.innerText = name
      button.onclick = fn

      if (admin) {
        button.setAttribute('hidden', '')
        button.classList.add('adminshow')
      }
      devElm.appendChild(button)
    }

    addButton('Toast', () => Logger.tell('This is a test of the screen toast'))
    addButton('Present Load', () => {
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
    addButton('Toggle connection status', () => {
      Logger.connectionStatus(!document.getElementById('connection').hasAttribute('hidden'))
    })
    addButton('Reload Page', () => Utils.reloadPage())
    const differentLogin = (type) => {
      return () => {
        window.discordOAuthExtra = type
        loader.api.auth()
      }
    }

    addButton('Normal Login', differentLogin(null))
    addButton('Login With Canary', differentLogin('canary'))
    addButton('Login With PTB', differentLogin('ptb'))

    addButton('Rebuild Site', () => {
      window.__LOADER.util.presentLoad('Rebuilding site')
      fetch('/', { method: 'DELETE' }).then(() => location.reload())
    }, true)

    addButton('Disable DEV mode', () => { window.location.search = '' })

    const wsInfo = document.createElement('div')
    const ws = loader.api.ws
    const setInfo = () => {
      wsInfo.innerText =
        `Connected: ${ws.connected}\n` +
        `Authorized: ${Boolean(loader.api.user)}\n` +
        `Ping: ${ws.ping}ms\n` +
        `Connection ID: ${ws.meta.connection}\n` +
        `Worker: ${ws.meta.region}/${ws.meta.worker}`
    }

    setInfo()
    ws.waitForConnection().then(() => setInfo())
    setInterval(() => {
      setInfo()
    }, 5000)

    devElm.appendChild(wsInfo)
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