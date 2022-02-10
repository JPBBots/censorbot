import { Snowflake } from 'discord-api-types'
import { Embed } from '@jadl/embed'
import { Collection } from 'mongodb'
import { GuildDB, PunishmentLevel, PunishmentType } from '@jpbbots/cb-typings'
import { WorkerManager } from '../../managers/Worker'
import { NonFatalError } from '../../utils/NonFatalError'

import { Timeouts } from './Timeouts'

export interface PunishmentSchema {
  guild: Snowflake
  user: Snowflake
  warnings: number[]
}

export class PunishmentManager {
  timeouts = new Timeouts(this)

  constructor(public worker: WorkerManager) { }

  get db(): Collection<PunishmentSchema> {
    return this.worker.db.collection('punish')
  }

  get requests() {
    return this.worker.requests
  }

  async config(id: Snowflake): Promise<GuildDB> {
    return await this.worker.db.config(id)
  }

  public hasPerms(
    guildId: Snowflake,
    punishment: PunishmentType
  ): true | string {
    switch (punishment) {
      case PunishmentType.GiveRole:
        if (!this.worker.hasPerms(guildId, 'manageRoles')) return 'Manage Roles'
        break
      case PunishmentType.Kick:
        if (!this.worker.hasPerms(guildId, 'kick')) return 'Kick Members'
        break
      case PunishmentType.Ban:
        if (!this.worker.hasPerms(guildId, 'ban')) return 'Ban Members'
        break
      case PunishmentType.Timeout:
        if (!this.worker.hasPerms(guildId, 'moderateMembers'))
          return 'Timeout Members'
        break
    }
    return true
  }

  relativeTimeIn(length: number) {
    return `<t:${Math.floor(
      new Date(new Date(Date.now() + length).toUTCString()).getTime() / 1000
    )}:R>`
  }

  async punish(
    guild: Snowflake,
    user: Snowflake,
    roles: Snowflake[]
  ): Promise<void> {
    const db = await this.config(guild)

    if (!db.punishments.levels.length) return

    let punish = await this.db.findOne({ guild, user })

    if (!punish) {
      punish = {
        guild,
        user,
        warnings: []
      }
    }

    punish.warnings.push(Date.now())
    if (db.punishments.expires) {
      punish.warnings = punish.warnings.filter(
        (x) => Date.now() < x + (db.punishments.expires ?? 0)
      )
    }

    const level = db.punishments.levels.find(
      (x) => x.amount === punish!.warnings.length
    )

    if (level) {
      const hasPerms = this.hasPerms(guild, level.type)
      if (typeof hasPerms === 'string') {
        throw new Error(hasPerms)
      }
      switch (level.type) {
        case PunishmentType.GiveRole:
          void this.giveRole(guild, user, level, roles)
          break
        case PunishmentType.Kick:
          void this.kick(guild, user, level, roles)
          break
        case PunishmentType.Ban:
          void this.ban(guild, user, level, roles)
          break
        case PunishmentType.Timeout:
          void this.timeout(guild, user, level, roles)
          break
      }
    }

    await this.db.updateOne(
      { guild, user },
      {
        $set: punish
      },
      {
        upsert: true
      }
    )
  }

  punishmentNames = {
    [PunishmentType.GiveRole]: 'Given Role',
    [PunishmentType.Ban]: 'Banned',
    [PunishmentType.Kick]: 'Kicked',
    [PunishmentType.Timeout]: 'Timed Out'
  }

  async sendLog(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel,
    extra?: string
  ): Promise<void> {
    const db = await this.config(guild)
    if (!db.log || !db.id || !this.worker.responses.canLog(db.id, db.log))
      return

    await this.requests.sendMessage(
      db.log,
      new Embed()
        .color('Red')
        .title(`User ${this.punishmentNames[punishment.type]}`)
        .description(
          `<@${user}> reached ${punishment.amount} warnings.${extra ? `\n\n${extra}` : ''
          }`
        )
        .timestamp()
    )
  }

  positivePunishmentNames = {
    [PunishmentType.GiveRole]: 'Removed Role',
    [PunishmentType.Ban]: 'Unbanned'
  }

  async sendPositiveLog(
    guild: Snowflake,
    user: Snowflake,
    type: PunishmentType,
    extra?: string
  ): Promise<void> {
    const db = await this.config(guild)
    if (!db.log || !db.id || !this.worker.responses.canLog(db.id, db.log))
      return

    await this.requests.sendMessage(
      db.log,
      new Embed()
        .color(0x2ecc71)
        .title(`User ${this.positivePunishmentNames[type]}`)
        .description(`<@${user}>${extra ? `\n\n${extra}` : ''}`)
        .timestamp()
    )
  }

  async timeout(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Timeout },
    roles: Snowflake[]
  ) {
    if (this.worker.isManageable(guild, user, roles)) {
      await this.requests.timeoutMember(
        guild,
        user,
        punishment.time,
        'Reached max warnings'
      )

      await this.sendLog(
        guild,
        user,
        punishment,
        `Will be removed ${this.relativeTimeIn(punishment.time)}`
      )
    } else {
      await this.sendLog(
        guild,
        user,
        punishment,
        '(Though the user was unable to be timed out due to permissions)'
      )
    }
  }

  async giveRole(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.GiveRole },
    roles: Snowflake[]
  ): Promise<void> {
    if (
      !punishment.role ||
      !this.worker.guildRoles.get(guild)?.has(punishment.role)
    )
      throw new NonFatalError('No muted role has been set')

    if (this.worker.isManageable(guild, user, roles, false)) {
      await this.requests.addRole(guild, user, punishment.role)

      await this.sendLog(
        guild,
        user,
        punishment,
        `Received <@&${punishment.role}>${punishment.time
          ? `\nWill be removed ${this.relativeTimeIn(punishment.time)}`
          : ''
        }`
      )

      if (punishment.time) {
        await this.timeouts.add(
          guild,
          user,
          PunishmentType.GiveRole,
          Date.now() + punishment.time,
          punishment.role
        )
      }
    } else {
      await this.sendLog(
        guild,
        user,
        punishment,
        '(Though the user was unable to be muted due to permissions)'
      )
    }
  }

  async removeRole(
    guild: Snowflake,
    user: Snowflake,
    role: Snowflake,
    extra: boolean
  ): Promise<void> {
    await this.requests.removeRole(guild, user, role)

    await this.timeouts.remove(guild, user)

    void this.sendPositiveLog(
      guild,
      user,
      PunishmentType.GiveRole,
      extra ? 'Role manually removed.' : 'TODO' // `After ${(db.punishment.time ?? 0) / 60000} minutes`
    )
  }

  async kick(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Kick },
    roles: Snowflake[]
  ): Promise<void> {
    if (this.worker.isManageable(guild, user, roles)) {
      await this.requests.kickMember(guild, user, {
        reason: 'Reached max warnings'
      })

      await this.sendLog(guild, user, punishment)
    } else {
      await this.sendLog(
        guild,
        user,
        punishment,
        '(Though the user was unable to be kicked due to permissions)'
      )
    }
  }

  async ban(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Ban },
    roles: Snowflake[]
  ): Promise<void> {
    if (this.worker.isManageable(guild, user, roles)) {
      await this.requests.banMember(guild, user, {
        reason: 'Reached max warnings.'
      })

      await this.sendLog(
        guild,
        user,
        punishment,
        punishment.time
          ? `Will be unbanned ${this.relativeTimeIn(punishment.time)}`
          : ''
      )

      if (punishment.time) {
        await this.timeouts.add(
          guild,
          user,
          PunishmentType.Ban,
          Date.now() + punishment.time
        )
      }
    } else {
      await this.sendLog(
        guild,
        user,
        punishment,
        '(Though the user was unable to be banned due to permissions)'
      )
    }
  }

  async unban(guild: Snowflake, user: Snowflake): Promise<void> {
    await this.requests.unbanMember(guild, user).catch(() => { })

    await this.timeouts.remove(guild, user)

    await this.sendPositiveLog(
      guild,
      user,
      PunishmentType.Ban,
      'TODO' // `After ${(db.punishment.time ?? 0) / 60000} minutes`
    )
  }
}
