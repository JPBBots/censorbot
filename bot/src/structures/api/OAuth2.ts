import { ApiManager } from '../../managers/Api'

import Crypto from 'crypto'
import qs from 'querystring'

import { APIUser, RESTPostOAuth2AccessTokenResult, RESTPostOAuth2AccessTokenURLEncodedData } from 'discord-api-types'
import { User } from 'typings/api'
import { Collection } from 'mongodb'

export class OAuth2 {
  constructor (public manager: ApiManager) {}

  get db (): Collection {
    return this.manager.db.collection('users')
  }

  private createToken (): string {
    return Crypto.createHash('sha256')
      .update(Crypto.randomBytes(8).toString('hex'))
      .update(`${Date.now()}`)
      .update(`${this.manager.config.oauth.mySecret}`)
      .digest('hex')
  }

  async callback (code: string, host: string): Promise<{ user: APIUser, db: User }> {
    const oauthUser = await this._bearer(code, host)
    if (!oauthUser) throw new Error('Invalid Code')

    const user = await this.getUser(oauthUser.access_token)
    if (!user) throw new Error('Invalid User')

    const currentUser = await this.db.findOne({ id: user.id })

    const token = currentUser?.token ?? this.createToken()

    const db: User = {
      id: user.id,
      bearer: oauthUser.access_token,
      token,
      avatar: user.avatar,
      tag: `${user.username}#${user.discriminator}`
    }

    await this.db.updateOne({ id: db.id }, { $set: db }, { upsert: true })

    return { user, db }
  }

  private async _bearer (code: string, host: string): Promise<RESTPostOAuth2AccessTokenResult | false> {
    const user = await this.manager.rest.request('POST', '/oauth2/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
        client_id: this.manager.config.id,
        client_secret: this.manager.config.oauth.secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${host}/callback`,
        scope: 'identify guilds'
      } as RESTPostOAuth2AccessTokenURLEncodedData,
      parser: qs.stringify
    }).catch(() => false)

    if (!user || !user.access_token) return false

    return user
  }

  public async getUser (token: string): Promise<APIUser | false> {
    const user = await this.manager.rest.request('GET', '/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!user || !user.id) return false

    return user
  }
}
