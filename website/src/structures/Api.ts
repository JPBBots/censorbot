import { Utils } from './Utils'
import { Logger } from './Logger'

export class CensorBotApi {
  public user: User
  public guilds: ShortGuild[]
  private waitingForUser: Function[]
  constructor () {
    this.waitingForUser = []

    this.loginButton.onmouseover = () => {
      if (this.user) this.loginButton.innerText = 'Logout'
    }
    this.loginButton.onmouseleave = () => {
      if (this.user) this.loginButton.innerText = `${this.user.tag}`
    }

    this.loginButton.onclick = () => {
      if (this.user) this.logout()
      else this.auth()
    }

    this.fetch()
  }

  public get loginButton () {
    return document.getElementById('login')
  }

  private async fetch (): Promise<boolean> {
    let user
    if (this.token) {
      user = await this.getSelf()
    }
    this.user = user
    if (!user) {
      this.loginButton.innerText = 'Login'
      this.loginButton.removeAttribute('loggedin')
      this.loginButton.style.removeProperty('min-width')
      return false
    } else {
      this.loginButton.innerText = `${this.user.tag}`
      this.loginButton.setAttribute('loggedin', '')
      this.loginButton.style.setProperty('min-width', this.loginButton.offsetWidth + 'px')
      if (this.waitingForUser) this.waitingForUser.forEach(x => x())
      return true
    }
  }

  /**
   * Current API Base Endpoint
   */
  static get url (): string {
    return `${window.location.protocol}//${window.location.hostname}/api`
  }

  /**
   * Gets token
   */
  get token () {
    var name = 'token='
    var ca = document.cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
  }

  private _formUrl (url: string): string {
    return CensorBotApi.url + url
  }

  private async request (message: false|string, method: string, url: string, body?: object, returnErrors?: number): Promise<any|false> {
    if (message) Utils.presentLoad(message)

    const headers = new Headers()

    if (method !== 'GET') headers.set('Content-Type', 'application/json')
    if (this.token) headers.set('Authorization', this.token)

    const req = await fetch(this._formUrl(url), {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(body) : null
    })

    const response = await req.json()

    if (message) Utils.stopLoad()

    if (!req.ok && !(returnErrors && returnErrors === req.status)) {
      if (response.message) Logger.tell('Error: ' + response.error)
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

  private async logout (redir: boolean = true) {
    await this.request(null, 'DELETE', '/auth')

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    this.guilds = null

    if (redir && window.location.pathname !== '/') Utils.setPath()

    this.fetch()
  }

  private async auth (required?: boolean): Promise<boolean> {
    Utils.presentLoad('Waiting for you to authorize...')
    await this.logout(false)

    await Utils.openWindow(this._formUrl('/auth' + (window.discordOAuthExtra || '')), 'Login')

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

    Utils.presentLoad('Logging you in...')

    const fet = await this.fetch()

    Utils.stopLoad()

    return fet
  }

  async waitForUser (): Promise<void> {
    return new Promise(resolve => {
      if (this.user || !this.waitingForUser) resolve()
      this.waitingForUser.push(() => resolve())
    })
  }

  public async getSelf (): Promise<User> {
    return this.request(false, 'GET', '/users/@me')
  }

  public async getGuilds (): Promise<ShortGuild[]|false> {
    if (!this.token && !await this.auth(true)) return false

    if (this.guilds) return this.guilds

    const result = await this.request('Fetching servers', 'GET', '/guilds')
    if (!result) return false

    this.guilds = result

    return result
  }

  public async getGuild (id: Snowflake): Promise<GuildData|false> {
    if (!this.token && !await this.auth(true)) return false

    const guild = await this.request('Fetching server', 'GET', `/guilds/${id}`, null, 404)

    if (guild.error === 'Not In Guild') {
      const back = document.createElement('a')
            back.innerText = 'Back'
            back.style.marginRight = '7px'
            back.classList.add('button')
            back.onclick = () => {
              Utils.stopLoad()
              Utils.setPath('/dashboard')
            }
      const invite = document.createElement('a')
            invite.innerText = 'Invite'
            invite.classList.add('button')
            invite.onclick = async () => {
              await Utils.openWindow(this._formUrl('/invite?id=' + id), 'Invite')
              Utils.reloadPage()
            }
      const div = document.createElement('div')
            div.appendChild(document.createTextNode('Not in server.'))
            div.appendChild(document.createElement('br'))
            div.appendChild(document.createElement('br'))
            div.appendChild(back)
            div.appendChild(invite)
      Utils.presentLoad(div)
      return false
    }
    return guild
  }

  public async postSettings (id: Snowflake, data: GuildDB): Promise<GuildDB|false> {
    if (!this.token && !await this.auth(true)) return false

    return this.request('Saving...', 'POST', `/guilds/${id}`, data)
  }

  public async postPremium (guilds: Snowflake[]): Promise<Snowflake[]|false> {
    if (!this.token && !await this.auth(true)) return false

    const response = await this.request('Setting premium servers', 'POST', '/users/@me/premium', { guilds })

    if (response) this.user.premium.guilds = response
    return response
  }
}