import React from 'react'

import { ShortGuild, User } from 'typings'
import { Utils } from 'utils/Utils'
import { Logger } from './Logger'
import { WebsocketManager } from './WebsocketManager'

import Router from 'next/router'

export enum LoggingInState {
  Loading = 0,
  LoggingIn,
  LoggedIn
}

export interface ApiData {
  user?: User
  guilds?: ShortGuild[]
  loggingIn: LoggingInState
}

export const DataContext = React.createContext({} as ApiData)

export class Api {
  logger = Logger

  get data (): ApiData { return { loggingIn: LoggingInState.Loading } }
  public setData (data: Partial<ApiData>) {}

  private readonly waitingUser: Array<(user: User | undefined) => void> = []

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

  public async login (required: boolean = false) {
    if (this.token) return await this.updateUser()

    const user = await Utils.openWindow('/api/auth/discord', 'Login')
      .then(async () => await this.updateUser())

    if (!user) {
      Logger.error('Failed to authorize')
      if (required) void Router.push('/')
    }
  }

  public logout () {
    this.ws.tell('LOGOUT')

    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    this.setData({
      user: undefined,
      guilds: undefined,
      loggingIn: LoggingInState.Loading
    })

    if (Router.pathname.includes('dashboard')) void Router.push('/')
  }

  handleOpen () {
    if (this.token) {
      void this.updateUser()
    } else this.setData({ loggingIn: LoggingInState.Loading })
  }

  handleClose () {

  }

  async updateUser (): Promise<User | undefined> {
    return await new Promise(resolve => {
      if (this.data.loggingIn === LoggingInState.LoggingIn) {
        return this.waitingUser.push(resolve)
      }
      this.setData({ loggingIn: LoggingInState.LoggingIn })

      void this.getUser()
        .then((user) => {
          resolve(user)
          this.waitingUser.forEach(req => {
            req(user)
          })
          this.setData({ loggingIn: LoggingInState.LoggingIn })

          if (Router.pathname.includes('dashboard')) void this.updateGuilds()
        })
    })
  }

  private async getUser () {
    if (!this.token) return undefined
    const user = await this.ws.request('AUTHORIZE', { token: this.token, customer: false })

    if (user) this.setData({ user })

    return user
  }

  async updateGuilds () {
    if (!this.data.user) await this.login(true)
    if (!this.data.user) return

    const guilds = await this.ws.request('GET_GUILDS').catch(() => null)

    if (!guilds) return

    this.setData({ guilds })
  }
}
