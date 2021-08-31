import { Injectable } from '@nestjs/common'

import Crypto from 'crypto'
import qs from 'querystring'
import { Config } from '../../config'
import { ShortGuild, User } from 'typings'
import { APIGuild, APIUser, RESTPostOAuth2AccessTokenResult, RESTPostOAuth2AccessTokenURLEncodedData } from 'discord-api-types'
import { DiscordService } from './discord.service'
import { PermissionsUtils } from 'discord-rose'
import { DatabaseService } from './database.service'

@Injectable()
export class OAuthService {
  constructor (
    private readonly database: DatabaseService,
    private readonly rest: DiscordService
  ) {}

  get db () {
    return this.database.collection('users')
  }

  private createToken (): string {
    return Crypto.createHash('sha256')
      .update(Crypto.randomBytes(8).toString('hex'))
      .update(`${Date.now()}`)
      .update(`${Config.oauth.mySecret}`)
      .digest('hex')
  }

  async callback (code: string, host: string): Promise<string> {
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
      email: user.email,
      tag: `${user.username}#${user.discriminator}`
    }

    await this.db.updateOne({ id: db.id }, { $set: db }, { upsert: true })

    return token
  }

  private async _bearer (code: string, host: string): Promise<RESTPostOAuth2AccessTokenResult | false> {
    const user = await this.rest.request('POST', '/oauth2/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
        client_id: Config.id,
        client_secret: Config.oauth.secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `https://${host}/api/auth/discord/callback`,
        scope: Config.dashboardOptions.scopes.join(' ')
      } as RESTPostOAuth2AccessTokenURLEncodedData,
      parser: qs.stringify
    }).catch(() => false)

    if (!user || !user.access_token) return false

    return user
  }

  public async getUser (token: string): Promise<APIUser | false> {
    const user = await this.rest.request('GET', '/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!user || !user.id) return false

    return user
  }

  public async getGuilds (token: string): Promise<ShortGuild[] | false> {
    const guilds = await this.rest.request('GET', '/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }) as APIGuild[]

    if (!guilds || !Array.isArray(guilds)) return false

    return guilds.filter(x => x.owner as boolean || PermissionsUtils.has(Number(x.permissions), Config.dashboardOptions.requiredPermission))
      .filter(x => Config.custom.allowedGuilds ? Config.custom.allowedGuilds.includes(x.id) : true)
      .map(x => ({ n: x.name, i: x.id, a: x.icon }))
  }
}
