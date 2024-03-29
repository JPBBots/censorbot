import { APIMessage, Snowflake } from 'discord-api-types/v9'
import { EmbedWithSendback } from '@jadl/builders'
import { Collection, WithoutId } from 'mongodb'
import {
  GuildDB,
  PunishmentLevel,
  PunishmentType,
  PunishmentSchema
} from '@censorbot/typings'
import { WorkerManager } from '../../managers/Worker'
import { NonFatalError } from '@censorbot/utils'

import { Timeouts } from './Timeouts'

export class PunishmentManager {
  timeouts = new Timeouts(this)

  constructor(public worker: WorkerManager) {}

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

    let punish: WithoutId<PunishmentSchema> | null = await this.db.findOne({
      guild,
      user
    })

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
        (x) => Date.now() < x + db.punishments.expires!
      )
    }

    const level =
      db.punishments.levels.find((x) => x.amount === punish!.warnings.length) ??
      [...db.punishments.levels.sort((a, b) => a.amount - b.amount)].pop()

    if (level && level.amount <= punish!.warnings.length) {
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

  log(guild: Snowflake, positive: boolean) {
    return new EmbedWithSendback<Promise<APIMessage | null>>(async (embed) => {
      return await (async () => {
        const db = await this.config(guild)
        const logChannel = db.punishments.log ?? db.log

        if (
          !logChannel ||
          !db.id ||
          !this.worker.responses.canLog(db.id, logChannel)
        )
          return null

        return await this.requests.sendMessage(logChannel, embed)
      })()
    })
      .color(positive ? 0x2ecc71 : 'Red')
      .timestamp()
  }

  async timeout(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Timeout },
    roles: Snowflake[]
  ) {
    const manageable = this.worker.isManageable(guild, user, roles, true, true)
    if (manageable) {
      await this.requests.timeoutMember(
        guild,
        user,
        punishment.time,
        'Reached max warnings'
      )
    }

    await this.log(guild, false)
      .title('User Timed Out')
      .description(
        `<@${user}> reached ${punishment.amount} warnings\n\n${
          manageable
            ? `Will be removed ${this.relativeTimeIn(punishment.time)}`
            : '(Though the user was unable to be timed out due to permissions)'
        }`
      )
      .send()
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

    const manageable = this.worker.isManageable(guild, user, roles, false)
    if (manageable) {
      await this.requests.addRole(guild, user, punishment.role)

      if (punishment.time) {
        await this.timeouts.add(
          guild,
          user,
          PunishmentType.GiveRole,
          Date.now() + punishment.time,
          punishment.role
        )
      }
    }

    await this.log(guild, false)
      .title('User Given Role')
      .description(
        `<@${user}> reached ${punishment.amount} warnings\n\n${
          manageable
            ? `Received <@&${punishment.role}>${
                punishment.time
                  ? `\nWill be removed ${this.relativeTimeIn(punishment.time)}`
                  : ''
              }`
            : '(Though the user was unable to be given the role due to permissions)'
        }`
      )
      .send()
  }

  async removeRole(
    guild: Snowflake,
    user: Snowflake,
    role: Snowflake,
    manual: boolean
  ): Promise<void> {
    let issue: string | null = null

    if (!manual) {
      if (this.worker.guildRoles.get(guild)?.has(role)) {
        await this.requests.removeRole(guild, user, role).catch((err) => {
          issue = err.message
        })
      } else {
        issue = 'Role no longer exists'
      }
    }

    await this.timeouts.remove(guild, user)

    await this.log(guild, true)
      .title(`Role Removed from User`)
      .description(
        `<@${user}>\n\nRole ${manual ? 'manually' : 'automatically'} removed` +
          (issue ? '\n\nHowever it failed because ' + issue : '')
      )
      .send()
  }

  async kick(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Kick },
    roles: Snowflake[]
  ): Promise<void> {
    const manageable = this.worker.isManageable(guild, user, roles)
    if (manageable) {
      await this.requests.kickMember(guild, user, {
        reason: 'Reached max warnings'
      })
    }

    await this.log(guild, false)
      .title('User Kicked')
      .description(
        `<@${user}> reached ${punishment.amount} warnings\n\n${
          manageable
            ? ''
            : '(Though the user was unable to be kicked due to permissions)'
        }`
      )
      .send()
  }

  async ban(
    guild: Snowflake,
    user: Snowflake,
    punishment: PunishmentLevel & { type: PunishmentType.Ban },
    roles: Snowflake[]
  ): Promise<void> {
    const manageable = this.worker.isManageable(guild, user, roles)
    if (manageable) {
      await this.requests.banMember(guild, user, {
        reason: 'Reached max warnings.'
      })

      if (punishment.time) {
        await this.timeouts.add(
          guild,
          user,
          PunishmentType.Ban,
          Date.now() + punishment.time
        )
      }
    }

    await this.log(guild, false)
      .title('User Banned')
      .description(
        `<@${user}> reached ${punishment.amount} warnings\n\n${
          manageable
            ? punishment.time
              ? `Will be unbanned ${this.relativeTimeIn(punishment.time)}`
              : ''
            : '(Though the user was unable to be banned due to permissions)'
        }`
      )
      .send()
  }

  async unban(guild: Snowflake, user: Snowflake): Promise<void> {
    await this.requests.unbanMember(guild, user).catch(() => {})

    await this.timeouts.remove(guild, user)

    await this.log(guild, true)
      .title('User Unbanned')
      .description(`<@${user}>`) // TODO: something?
      .send()
  }
}
