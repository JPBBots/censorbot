import { Utils } from '../utils/Utils'
import Router from 'next/router'
import { api } from 'pages/_app'
import { LoginState } from './Api'

function swap (json: any) {
  const ret = {} as Record<any, any>
  for (const key in json) {
    ret[json[key]] = key
  }
  return ret
}

class StatsManager {
  win?: Window
  interval?: number

  open () {
    this.win = window.open('', 'stats', 'height=320,width=400') ?? undefined
    if (!this.win) return

    this.win.onmessage = (dat) => {
      this._handleEvent(dat.data)
    }

    this.win.document.body.innerHTML = `
      <script src="https://tools.jt3ch.net/cookies.js"></script>
      <title>Stats</title>
      <pre id="stats"></pre>
      <button onclick="window.postMessage('TOGGLE_HEADLESS')">Toggle Headless</button>
      <button onclick="window.postMessage('RESTART_SOCKET')">Restart Socket</button>
    `

    const int = setInterval(() => {
      if (this.win?.closed) {
        clearInterval(int)

        clearInterval(this.interval)
      }
    }, 5000)

    this.write()
    setInterval(() => {
      this.write()
    }, 100)
  }

  get staging () {
    return location.host.startsWith('staging.')
  }

  get runnerHash () {
    return crypto.getRandomValues(new Int32Array(Number((Date.now() / 100000000).toFixed(0))))[0].toString(36).replace('-', '')
  }

  get headless () {
    return Utils.getCookie('headless') === 'true'
  }

  get info () {
    return {
      connected: api.ws.open,
      hashRandom: this.runnerHash,
      ping: `${api.ws.ping}ms`,
      staging: this.staging,
      headless: this.headless,
      meta: api.ws.meta,
      loginState: `${api.data.login} (${swap(LoginState)[api.data.login]})`,
      build: window.__NEXT_DATA__.buildId,
      page: Router.pathname,
      query: Router.query
    }
  }

  write () {
    if (!this.win) return

    const stats = this.win.document.getElementById('stats')
    if (!stats) return

    stats.innerHTML = JSON.stringify(this.info, null, 2)
  }

  private _handleEvent (event: string) {
    switch (event) {
      case 'TOGGLE_HEADLESS': {
        const current = Utils.getCookie('headless')
        document.cookie = `headless=${!(current === 'true')}`
        location.reload()
        break
      }
      case 'RESTART_SOCKET': {
        void api.ws.ws?.close()
        break
      }
    }
  }
}

export const stats = new StatsManager()
