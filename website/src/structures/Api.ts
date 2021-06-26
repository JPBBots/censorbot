import React from 'react'

import { ShortGuild, User } from 'typings'
import { Utils } from 'utils/Utils'
import { Logger } from './Logger'
import { WebsocketManager } from './WebsocketManager'

export interface ApiData {
  user?: User
  guilds?: ShortGuild[]
}

export const DataContext = React.createContext({} as ApiData)

export class Api {
  logger = Logger

  get data (): ApiData { return {} }
  public setData (data: ApiData) {}

  ws = new WebsocketManager(this)

  get token () {
    const name = 'token='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
  }

  public login () {
    if (this.token) return this.updateUser()

    void Utils.openWindow('/api/auth/discord', 'Login')
      .then(() => {
        void this.updateUser()
      })
  }

  public logout () {
    this.ws.tell('LOGOUT')

    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    this.setData({
      user: undefined,
      guilds: undefined
    })
  }

  handleOpen () {
    if (this.token) {
      void this.updateUser()
    }
  }

  handleClose () {
    this.setData({ user: undefined, guilds: undefined })
  }

  async updateUser () {
    let user
    if (this.token) {
      user = await this.ws.request('AUTHORIZE', { token: this.token, customer: false })
    }

    if (user) this.setData({ user })

    return user
  }
}
