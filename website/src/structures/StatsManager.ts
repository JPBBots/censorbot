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

    this.win.document.body.innerHTML = `
      <title>Stats</title>
      <pre id="stats"></pre>
      <button>Test</button>
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

  get info () {
    return {
      connected: api.ws.open,
      ping: `${api.ws.ping}ms`,
      staging: this.staging,
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
}

export const stats = new StatsManager()
