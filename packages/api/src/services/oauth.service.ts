import { Injectable } from '@nestjs/common'

import Crypto from 'crypto'
import Config from '@censorbot/config'
import { ShortGuild, User } from '@censorbot/typings'
import {
  APIUser,
  RESTPostOAuth2AccessTokenResult,
  Snowflake
} from 'discord-api-types/v9'
import { DiscordService } from './discord.service'
import { PermissionUtils } from 'jadl'
import { DatabaseService } from './database.service'
import { ThreadService } from './thread.service'
import { EventEmitter } from '@jpbberry/typed-emitter'
import { WithoutId } from 'mongodb'

@Injectable()
export class OAuthService extends EventEmitter<{ USER_UPDATE: Snowflake }> {
  constructor(
    private readonly database: DatabaseService,
    private readonly rest: DiscordService,
    private readonly thread: ThreadService
  ) {
    super()
  }

  get db() {
    return this.database.collection('users')
  }

  private createToken(): string {
    return Crypto.createHash('sha256')
      .update(Crypto.randomBytes(8).toString('hex'))
      .update(`${Date.now()}`)
      .update(`${Config.oauth.mySecret}`)
      .digest('hex')
  }

  async callback(code: string, host: string, https: boolean): Promise<string> {
    const oauthUser = await this._bearer(code, host, https)
    if (!oauthUser) throw new Error('Invalid Code')

    const user = await this.getUser(oauthUser.access_token)
    if (!user) throw new Error('Invalid User')

    const currentUser = await this.db.findOne({ id: user.id })

    const token = currentUser?.token ?? this.createToken()

    const db: WithoutId<User> = {
      id: user.id,
      bearer: oauthUser.access_token,
      token,
      avatar: user.avatar,
      email: user.verified ? user.email : undefined,
      tag: `${user.username}#${user.discriminator}`
    }

    await this.db.updateOne({ id: db.id }, { $set: db }, { upsert: true })

    this.emit('USER_UPDATE', user.id)

    return token
  }

  private async _bearer(
    code: string,
    host: string,
    https: boolean
  ): Promise<RESTPostOAuth2AccessTokenResult | false> {
    const user = await this.rest
      .authorizeToken({
        client_id: Config.id,
        client_secret: Config.oauth.secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${
          https ? 'https' : 'http'
        }://${host}/api/auth/discord/callback`
      })
      .catch((err) => {
        console.log(err)
        return null
      })

    if (!user || !user.access_token) return false

    return user
  }

  public async getUser(token: string): Promise<APIUser | false> {
    const user = await this.rest.getSelf(token)

    if (!user || !user.id) return false

    return user
  }

  public async getGuilds(token: string): Promise<ShortGuild[]> {
    const guilds = await this.rest.getUserGuilds(token)

    if (!guilds || !Array.isArray(guilds)) throw new Error('Unauthorized')

    const newGuilds = guilds
      .filter(
        (x) =>
          (x.owner as boolean) ||
          PermissionUtils.has(
            Number(x.permissions),
            Config.dashboardOptions.requiredPermission
          )
      )
      .filter((x) =>
        Config.custom.allowedGuilds
          ? [
              ...Config.custom.allowedGuilds,
              ...this.database.customBots.map((a) => a.guilds).flat()
            ].includes(x.id)
          : true
      )

    const inGuilds = await this.thread.sendCommand(
      'IN_GUILDS',
      newGuilds.map((x) => x.id)
    )

    return newGuilds.map((x) => {
      const customName = this.database.customBots.find((a) =>
        a.guilds.includes(x.id)
      )?.name
      return {
        name: x.name,
        id: x.id,
        icon: x.icon,
        joined: inGuilds.includes(x.id),
        group: customName ? `${customName} (Custom Bot)` : undefined
      }
    })
  }
}
