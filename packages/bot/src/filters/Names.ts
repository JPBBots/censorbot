import {
  FilterResultInfo,
  CensorMethods,
  ExceptionType,
  GuildDB,
  Plugin
} from '@censorbot/typings'

import { Event } from '@jpbberry/typed-emitter'

import {
  GatewayGuildMemberUpdateDispatchData,
  GatewayGuildMemberAddDispatchData
} from 'discord-api-types/v9'
import { BaseFilterHandler } from './Base'
import { DiscordEventMap } from 'jadl'
import { isBitOn } from '@censorbot/utils'

const deHoist = String.fromCharCode(856)

type EventData =
  | GatewayGuildMemberUpdateDispatchData
  | GatewayGuildMemberAddDispatchData

export class NamesFilterHandler extends BaseFilterHandler {
  static isHoisting = (name: string): boolean => {
    const char = name.charCodeAt(0)
    if (char < 65) return true
    if (char > 90 && char < 97) return true

    return false
  }

  handleCensor(
    member: EventData,
    db: GuildDB,
    response: FilterResultInfo
  ): void {
    if (!member.user) return

    const guild = this.worker.guilds.get(member.guild_id)
    if (!guild) return

    if (
      !this.worker.hasPerms(member.guild_id, 'manageNicknames') ||
      !this.worker.isManageable(
        member.guild_id,
        member.user.id,
        member.roles,
        true
      )
    ) {
      if (db.log)
        void this.worker.responses.errorLog(
          db,
          'Missing permissions to Manage Nicknames'
        )

      return
    }

    void this.worker.responses.log(
      CensorMethods.Names,
      member.nick ?? member.user.username,
      member,
      response,
      db
    )

    void this.worker.requests
      .setNickname(
        member.guild_id,
        member.user.id,
        db.removeNick && member.nick ? null : db.nickReplace
      )
      .catch(() => {})

    if (
      !this.worker.isExcepted(ExceptionType.Punishment, db.exceptions, {
        roles: member.roles
      }) &&
      isBitOn(db.punishments.allow, response.type)
    ) {
      void this.worker.punishments
        .punish(member.guild_id, member.user.id, member.roles)
        .catch(() => {})
    }
  }

  @Event('GUILD_MEMBER_UPDATE')
  @Event('GUILD_MEMBER_ADD')
  async onMember(
    member: DiscordEventMap['GUILD_MEMBER_ADD' | 'GUILD_MEMBER_UPDATE']
  ) {
    if (!member || !member.user || member.user.bot) return

    if (this.worker.isCustom(member.guild_id)) return

    const db = await this.worker.db.config(member.guild_id)

    let name = member.nick ?? member.user.username

    if (name === db.nickReplace) return

    if (
      isBitOn(db.censor, CensorMethods.Names) &&
      !this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        roles: member.roles
      })
    ) {
      const res = this.test(name, db, { roles: member.roles })

      if (res) return this.handleCensor(member, db, res)
    }

    if (
      isBitOn(db.plugins, Plugin.AntiHoist) &&
      NamesFilterHandler.isHoisting(name) &&
      this.worker.hasPerms(member.guild_id, 'manageNicknames') &&
      this.worker.isManageable(
        member.guild_id,
        member.user.id,
        member.roles,
        true
      ) &&
      !this.worker.isExcepted(ExceptionType.AntiHoist, db.exceptions, {
        roles: member.roles
      })
    ) {
      if (name.length >= 32) name = name.substring(1, 32)
      await this.worker.requests
        .setNickname(member.guild_id, member.user.id, `${deHoist}${name}`)
        .catch(() => {})
    }
  }
}
