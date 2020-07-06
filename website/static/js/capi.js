/* global XMLHttpRequest */

class Capi {
  constructor () {
    this.registered = []
  }

  redirect (url) {
    window.location.href = url
  }

  register (obj) {
    this.registered.push(obj)
  }

  _disp (e, d) {
    this.registered.forEach(obj => {
      if (obj[e]) obj[e](d)
    })
  }

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

  get url () {
    return `${window.location.protocol}//${window.location.hostname}`
  }

  get api () {
    return `${this.url}/api`
  }

  request (method, url, body, addApi = true) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, `${addApi ? this.api : this.url}${url}`)

      xhr.onload = () => {
        var response = JSON.parse(xhr.response)

        if (response.error) return reject(response.error)

        resolve(response)
      }

      if (body) xhr.setRequestHeader('Content-Type', 'application/json')

      xhr.send(body ? JSON.stringify(body) : null)
    })
  }

  async getSelf () {
    if (!this.token) return false

    const cache = window.sessionStorage.getItem('CachedUser')
    if (cache) return JSON.parse(cache)

    const user = await this.request('GET', '/users/@me')
      .catch(() => false)

    if (user) window.sessionStorage.setItem('CachedUser', JSON.stringify(user))

    return user
  }

  async getGuilds () {
    const cache = window.sessionStorage.getItem('CachedGuilds')
    if (cache) return JSON.parse(cache)

    return await this.request('GET', '/guilds')
      .then(guilds => {
        if (guilds) window.sessionStorage.setItem('CachedGuilds', JSON.stringify(guilds))
        return guilds
      })
  }

  getGuild (id) {
    return this.request('GET', '/guilds/' + id)
  }

  getPremium () {
    return this.request('GET', '/premium')
  }

  async updateUser () {
    this._disp('logging')
    const user = await this.getSelf()
    if (!user) {
      this._disp('logout')
      return false
    }
    this._disp('login', user)
    return true
  }

  _openWindow (url) {
    return new Promise((resolve) => {
      const win = window.open(url, 'window', 'width=600,height=1000')
      const interval = setInterval(() => {
        if (win.closed) {
          resolve()
          clearInterval(interval)
        }
      }, 1000)
    })
  }

  async logout () {
    await this.request('DELETE', '/auth')
    window.sessionStorage.removeItem('CachedUser')
    window.sessionStorage.removeItem('CachedGuilds')
    this.updateUser()
  }

  async login (redir, ask) {
    await this._openWindow(ask ? `${this.url}/login` : `${this.api}/auth`)
    if (!await this.updateUser()) return
    if (redir) this.redirect(redir)
  }

  invite (id) {
    return this._openWindow(`${this.url}/invite${id ? `?id=${id}` : ''}`)
  }
}

window.api = new Capi()

window.onload = () => {
  window.api.updateUser()
}
