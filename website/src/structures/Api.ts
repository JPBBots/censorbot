import React from 'react'

import { GuildData, ShortGuild, User } from 'typings'
import { Utils } from 'utils/Utils'
import { Logger } from './Logger'
import { WebsocketManager } from './WebsocketManager'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'
import { WebSocketEventMap } from 'typings/websocket'
import { updateObject } from 'utils/updateObject'
import Pieces from 'utils/Pieces'
import { stats } from './StatsManager'
import Swal from 'sweetalert2'

export enum LoginState {
  Loading = 0,
  LoggedOut,
  LoggingIn,
  LoggedIn
}

export interface ApiData {
  user?: User
  guilds?: ShortGuild[]
  login: LoginState
  currentGuild?: GuildData
}

export const DataContext = React.createContext({} as ApiData)

export class Api {
  logger = Logger

  stats = stats

  get data (): ApiData { return { login: LoginState.Loading } }
  public setData (data: Partial<ApiData>) {}

  private readonly waitingUser: Array<(user: User | undefined) => void> = []

  ws = new WebsocketManager(this)

  constructor () {
    Router.events.on('routeChangeComplete', () => {
      if (!this.data.currentGuild) return

      if (!Router.asPath.includes(this.data.currentGuild.guild.i)) void this.unsubscribe(this.data.currentGuild.guild.i)
    })
  }

  private log (msg: string) {
    Logger.log('API', msg)
  }

  get token () {
    return Utils.getCookie('token')
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
      login: LoginState.LoggedOut
    })

    if (Router.pathname.includes('dashboard')) void Router.push('/')
  }

  handleOpen () {
    if (this.token) {
      void this.updateUser()
    } else this.setData({ login: LoginState.LoggedOut })
  }

  handleClose () {

  }

  async updateUser (): Promise<User | undefined> {
    return await new Promise(resolve => {
      if (this.data.login === LoginState.LoggingIn) {
        return this.waitingUser.push(resolve)
      }
      this.setData({ login: LoginState.LoggingIn })

      void this.getUser()
        .then((user) => {
          resolve(user)
          this.waitingUser.forEach(req => {
            req(user)
          })
          this.setData({ login: LoginState.LoggedIn })

          if (Router.pathname.includes('dashboard')) void this.updateGuilds()
        })
        .catch(() => {
          this.logout()
        })
    })
  }

  private async getUser () {
    if (!this.token) return undefined
    this.log('Retrieving user')

    const user = await this.ws.request('AUTHORIZE', { token: this.token, customer: false })

    if (user) this.setData({ user })

    return user
  }

  async updateGuilds () {
    if (!this.data.user) await this.login(true)
    if (!this.data.user) return
    this.log('Retrieving guilds')

    if (this.data.guilds) return

    const guilds = await this.ws.request('GET_GUILDS').catch(() => null)

    if (!guilds) return

    this.setData({ guilds })
  }

  async updateGuild (id: Snowflake) {
    if (!this.data.guilds) await this.updateGuilds()
    if (!this.data.guilds) return
    if (this.data.currentGuild?.guild.i === id) return

    this.log(`Subscribing to ${id}`)

    const guild = await this.ws.request('SUBSCRIBE', id)
      .catch(err => {
        if (err === 'Not In Guild') {
          return Swal.fire({
            text: 'Censor Bot is not in this server yet!',
            showConfirmButton: true,
            showCancelButton: true,
            imageUrl: 'https://static.jpbbots.org/censorbot.svg',
            imageWidth: 116,
            confirmButtonText: 'Invite'
          }).then(res => {
            if (res.isConfirmed) {
              return Utils.openWindow('/invite?id=' + id)
                .then(async () => {
                  return await this.updateGuild(id)
                })
            } else {
              void Router.push('/dashboard')
            }
          })
        } else if (err === 'Unauthorized') {
          Logger.error('You don\'t have access to this server')
          void Router.push('/dashboard')
        }
        return null
      })

    if (!guild) return

    this.setData({ currentGuild: guild })
  }

  _createUpdatedGuild (current: GuildData, newDb: any) {
    const obj = Object.assign({}, current)
    obj.db = updateObject(obj.db, Pieces.normalize(newDb))

    return obj
  }

  _handleGuildUpdate (data: WebSocketEventMap['CHANGE_SETTING']['receive']) {
    if (!this.data.currentGuild) return

    if (data.id !== this.data.currentGuild.guild.i) return

    this.setData({ currentGuild: this._createUpdatedGuild(this.data.currentGuild, data.data) })
  }

  waiting?: any
  timeout?: number
  resolve?: () => void

  async changeSettings (id: Snowflake, data: any) {
    Logger.setLoading(true)

    if (!this.waiting) this.waiting = data
    else {
      this.waiting = updateObject(this.waiting, data)
      clearTimeout(this.timeout)

      this.timeout = window.setTimeout(() => {
        this.resolve?.()
      }, 1000)

      return
    }

    this.timeout = window.setTimeout(() => {
      this.resolve?.()
    }, 1000)

    await new Promise<void>(resolve => {
      this.resolve = resolve
    })

    data = this.waiting
    this.waiting = undefined
    this.resolve = undefined

    console.debug('posting', data)

    await this.ws.request('CHANGE_SETTING', { id, data })
    Logger.setLoading(false)
  }

  async unsubscribe (id: Snowflake) {
    this.log(`Unsubscribing from ${id}`)

    this.ws.tell('UNSUBSCRIBE', id)

    this.setData({ currentGuild: undefined })
  }
}
