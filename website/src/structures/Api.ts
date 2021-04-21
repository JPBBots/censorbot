import { Utils } from './Utils'
import { Logger } from './Logger'

import { CensorBotWs } from './Websocket'

import { E } from './Elements'
import { AdminResponse, GuildData, GuildDB, ShortGuild, SmallID, Ticket, TicketTest, User } from '@typings/api'
import { Snowflake } from 'discord-api-types'
import { Loader } from '../Loader'

export class CensorBotApi {
  public user: User
  public guilds: ShortGuild[]
  private waitingForUser: Function[] = []

  public ws = new CensorBotWs(this)

  constructor (public loader: Loader) {
    this.loginButton.onclick = () => {
      if (this.user) document.getElementById('menu').toggleAttribute('hidden')
      else this.auth()
    }

    window.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).matches('#login')) document.getElementById('menu').setAttribute('hidden', '')
    })

    document.getElementById('logout').onclick = () => {
      this.logout()
    }

    this.ws.start()
  }

  handleOpen() {
    if (this.token) this._handleAuth()

    this.fetch()
  }

  private async _handleAuth() {
    await this.ws.waitForConnection()
    const user = await this.ws.request('AUTHORIZE', { token: this.token }).catch(() => false as false)
    if (!user) return

    this.user = user
  }

  public get loginButton() {
    return document.getElementById('login')
  }

  private async fetch(): Promise<boolean> {
    let user
    if (this.token) {
      user = await this.getSelf()
    }
    this.user = user
    if (!user) {
      this.loginButton.innerText = 'Login'
      this.loginButton.removeAttribute('loggedin')
      document.querySelectorAll('.adminshow').forEach(e => e.setAttribute('hidden', ''))
      return false
    } else {
      this.loginButton.innerText = `${this.user.tag}`
      this.loginButton.setAttribute('loggedin', '')
      if (this.user.admin) document.querySelectorAll('.adminshow').forEach(e => e.removeAttribute('hidden'))
      else document.querySelectorAll('.adminshow').forEach(e => e.setAttribute('hidden', ''))
      if (this.waitingForUser) this.waitingForUser.forEach(x => x())
      return true
    }
  }

  /**
   * Current API Base Endpoint
   */
  static get url(): string {
    return `${window.location.protocol}//${window.location.hostname}/ws`
  }

  /**
   * Gets token
   */
  get token () {
    return window.localStorage.getItem('token')
  }

  private async request(message: false | string, method: string, url: string, body?: object, returnErrors?: number): Promise<any | false> {
    if (message) Utils.presentLoad(message)

    const headers = new Headers()

    if (method !== 'GET') headers.set('Content-Type', 'application/json')
    if (this.token) headers.set('Authorization', this.token)

    const req = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && body ? JSON.stringify(body) : null
    })

    const response = await req.json()

    if (message) Utils.stopLoad()

    if (!req.ok && !(returnErrors && returnErrors === req.status)) {
      if (response.error) Logger.tell('Error: ' + response.error)
      Logger.log('API', `Error from ${url}: ${req.status} / ${req.statusText} = ${response.error}`)
      if (req.status === 401) {
        const auth = await this.auth(true)
        if (!auth) return false
        return this.request(message, method, url, body, returnErrors)
      }
      return false
    }

    return response
  }

  private async logout(redir: boolean = true) {
    this.ws.tell('LOGOUT')

    window.localStorage.removeItem('token')

    this.guilds = null

    if (redir && window.location.pathname !== '/') Utils.setPath()

    this.fetch()
  }

  public async auth(required?: boolean): Promise<boolean> {
    await this.ws.waitForConnection()
    Utils.presentLoad('Waiting for you to authorize...')
    await this.logout(false)

    await Utils.openWindow('/auth' + (window.discordOAuthExtra ? `?d=${window.discordOAuthExtra}` : ''), 'Login')

    const code = window.localStorage.getItem('code')

    Utils.presentLoad('Logging you in...')

    if (code) {
      const user = await this.ws.request('LOGIN', { code })

      this.user = user

      window.localStorage.setItem('token', user.token)
      window.localStorage.removeItem('code')
    }

    if (!this.token) {
      if (required) {
        if (confirm('Failed the authorize, try again?')) return this.auth(true)
        else {
          setTimeout(() => {
            Utils.setPath()
          }, 100)
        }
      } else Logger.tell('Failed to authorize')
      Utils.stopLoad()
      return false
    }

    const fet = await this.fetch()

    Utils.stopLoad()

    return fet
  }

  async waitForUser(): Promise<void> {
    await this.ws.waitForConnection()
    return new Promise(resolve => {
      if (this.user || !this.waitingForUser) resolve()
      this.waitingForUser.push(() => resolve())
      if (!this.token) this.auth(true)
    })
  }

  public async getSelf(): Promise<User | false> {
    await this.ws.waitForConnection()
    if (this.user) return this.user

    return this.ws.request('AUTHORIZE', { token: this.token }).catch(() => false as false)
  }

  public async getGuilds(): Promise<ShortGuild[] | false> {
    await this.waitForUser()
    if (!this.token && !await this.auth(true)) return false

    if (this.guilds) return this.guilds

    Utils.presentLoad('Getting your servers...')
    const result = await this.ws.request('GET_GUILDS')
    Utils.stopLoad()
    if (!result) return false

    this.guilds = result

    return result
  }

  public async getGuild(id: Snowflake): Promise<GuildData | false> {
    await this.waitForUser()
    if (!this.token && !await this.auth(true)) return false

    Utils.presentLoad('Finding your server')
    const guild = await this.ws.request('SUBSCRIBE', id)
      .catch(err => {
        if (err === 'Not In Guild') {
          Utils.presentLoad(E.create({
            elm: 'div',
            children: [
              { elm: 'text', text: 'Not in server.' },
              { elm: 'br' },
              { elm: 'br' },
              {
                elm: 'a',
                text: 'Back',
                classes: ['button'],
                events: {
                  click: () => {
                    Utils.stopLoad(),
                      Utils.setPath('/dashboard')
                  }
                }
              },
              { elm: 'br' },
              { elm: 'br' },
              {
                elm: 'a',
                text: 'Invite',
                classes: ['button'],
                attr: {
                  special: ''
                },
                events: {
                  click: async () => {
                    await Utils.openWindow('/invite?id=' + id, 'Invite')
                    Utils.reloadPage()
                  }
                }
              }
            ]
          }) as HTMLElement)
          return false as false
        } else console.error(err)
        return false as false
      })
    if (!guild) return false

    return guild
  }
  
  waitingForPost?: GuildDB = null
  timeout?: number = null

  resolve?: (value: unknown) => void = null

  public async postSettings(id: Snowflake, data: GuildDB): Promise<void|false> {
    if (!this.token && !await this.auth(true)) return false

    await this.waitForUser()

    Logger.connectionStatus(false)

    if (!this.waitingForPost) this.waitingForPost = data
    else {
      this.waitingForPost = Utils.patch(this.waitingForPost, data)
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.resolve(null)
      }, 600) as unknown as number
      return
    }

    this.timeout = setTimeout(() => {
      this.resolve(null)
    }, 600) as unknown as number

    await new Promise((resolve) => {
      this.resolve = resolve
    })

    data = this.waitingForPost
    this.waitingForPost = null

    await this.ws.request('CHANGE_SETTING', { id, data })

    Logger.connectionStatus(true)
  }

  public async postPremium(guilds: Snowflake[]): Promise<Snowflake[] | false> {
    if (!this.token && !await this.auth(true)) return false

    const response = await this.request('Setting premium servers', 'POST', '/users/@me/premium', { guilds })

    if (response) this.user.premium.guilds = response
    return response
  }

  public async getStats(show?: boolean): Promise<AdminResponse | false> {
    if (!this.token && !await this.auth(true)) return false

    let response
    if (this.user.admin) {
      response = await this.request(show ? 'Fetching statuses' : null, 'GET', '/admin', null, 401)
      if (!response) return false
    }

    if (!this.user.admin || response.error === 'Unauthorized') {
      Logger.tell('You are not authorized to access this location.')
      setTimeout(() => {
        Utils.setPath()
      }, 1000)
      return false
    }

    return response
  }

  public async restartShard(id: number): Promise<any> {
    if (!this.token && !await this.auth(true)) return false

    let response
    if (this.user.admin) {
      response = await this.request(null, 'DELETE', '/admin/shards/' + id, null, 401)
    }

    if (!response) return false
  }

  public async getTickets(): Promise<Ticket[] | false> {
    if (!this.token && !await this.auth(true)) return false
    let response
    if (this.user.admin) {
      response = await this.request('Fetching tickets', 'GET', '/admin/tickets', null, 401)
      if (!response) return false
    }

    if (!this.user.admin || response.error === 'Unauthorized') {
      Logger.tell('You are not authorized to access this location.')
      setTimeout(() => {
        Utils.setPath()
      }, 1000)
      return false
    }

    return response
  }

  public async testTicket(id: SmallID): Promise<TicketTest> {
    if (this.user.admin) return this.request('Fetching ticket', 'GET', '/admin/tickets/' + id)
  }

  public async acceptTicket(id: SmallID): Promise<{ success: boolean }> {
    if (this.user.admin) return this.request('Accepting ticket', 'POST', '/admin/tickets/' + id)
  }

  public async denyTicket(id: SmallID): Promise<{ success: boolean }> {
    if (this.user.admin) return this.request('Denying ticket', 'DELETE', '/admin/tickets/' + id)
  }
}