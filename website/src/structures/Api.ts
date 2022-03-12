import { GuildData } from '@jpbbots/cb-typings'
import { Utils } from 'utils/Utils'
import { Logger } from './Logger'
import { WebsocketManager } from './WebsocketManager'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'
import { updateObject } from 'utils/updateObject'
import Pieces from 'utils/Pieces'
import { store } from '@/store'
import { setUser } from '@/store/reducers/auth.reducer'
import { chargebee } from '@/pages/_app'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Api {
  static logger = Logger

  static ws = new WebsocketManager()

  static log(msg: string) {
    Logger.log('API', msg)
  }

  static get guildId() {
    if (!('window' in global)) return undefined

    return location.href.split('/')[4]?.match(/[0-9]{5,}/)?.[0] as
      | Snowflake
      | undefined
  }

  static get token() {
    return Utils.getCookie('token')
  }

  static async login(required: boolean = false, email?: boolean) {
    const user = await Utils.openWindow(
      `/api/auth/discord${email ? `?email=true` : ''}`,
      'Login'
    ).then(async () => await this.getUser())

    if (!user) {
      Logger.error('Failed to authorize')
      if (required) void Router.push('/')
    }

    return user
  }

  static async createPortal() {
    chargebee?.setPortalSession(async () => {
      return await this.ws.request('CREATE_PORTAL_SESSION')
    })

    chargebee?.createChargebeePortal().open()
  }

  static logout(userBound = true) {
    this.ws.tell('LOGOUT')

    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    if (userBound && Router.pathname.includes('dashboard'))
      void Router.push('/')
  }

  static async getUser() {
    if (!this.token) return undefined
    this.log('Retrieving user')

    const user = await this.ws.request('GET_USER')

    if (user) {
      store.dispatch(setUser(user))
    }

    return user
  }

  static async getGuilds() {
    this.log('Retrieving guilds')
    const guilds = await this.ws.request('GET_GUILDS')

    if (!guilds) return

    return guilds
  }

  static async getGuild(id: Snowflake) {
    this.log(`Subscribing to ${id}`)

    const guild = await this.ws.request('SUBSCRIBE', id).catch((err) => {
      if (err.message === 'Not In Guild') {
        return { notInGuild: true }
      } else if (err.message === 'Offline in Shard') {
        return { offlineInShard: true }
      }
    })

    if (!guild) return

    return guild
  }

  static _createUpdatedGuild(current: GuildData, newDb: any) {
    const obj = Object.assign({}, current)
    obj.db = updateObject(obj.db, Pieces.normalize(newDb))

    return obj
  }

  static waiting?: any
  static timeout?: number
  static resolve?: () => void

  static _resetTimer() {
    if (!this.timeout) return
    console.log('resetting timer')
    clearTimeout(this.timeout)

    this.timeout = window.setTimeout(() => {
      this.resolve?.()
    }, 1000)
  }

  static async changeSettings(id: Snowflake, data: any) {
    Logger.setLoading(true)

    if (!this.waiting) this.waiting = data
    else {
      this.waiting = updateObject(this.waiting, data)
      this._resetTimer()

      return
    }

    this.timeout = window.setTimeout(() => {
      this.resolve?.()
    }, 1000)

    await new Promise<void>((resolve) => {
      this.resolve = resolve
    })

    data = this.waiting
    this.waiting = undefined
    this.resolve = undefined
    this.timeout = undefined
    console.debug('posting', data)

    await this.ws.request('CHANGE_SETTING', { id, data })
    Logger.setLoading(false)
  }

  static async unsubscribe(id: Snowflake) {
    this.log(`Unsubscribing from ${id}`)

    this.ws.tell('UNSUBSCRIBE', id)
  }
}

if ('window' in global) {
  ;(global as any).api = Api
  ;(global as any).store = store
}
