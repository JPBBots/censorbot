import { ChannelType, Snowflake } from 'discord-api-types'
import { Embed, MembersResource } from 'discord-rose'
import { Collection } from 'mongodb'
import { GuildDB, PunishmentType } from 'typings'
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

  constructor (public worker: WorkerManager) {}

  get db (): Collection<PunishmentSchema> {
    return this.worker.db.collection('punish')
  }

  get members (): MembersResource {
    return this.worker.api.members
  }

  async config (id: Snowflake): Promise<GuildDB> {
    return await this.worker.db.config(id)
  }

  public checkPerms (guildId: Snowflake, db: GuildDB): boolean|string {
    if (db.punishment.type !== PunishmentType.Nothing) {
      switch (db.punishment.type) {
        case PunishmentType.Mute:
          if (!this.worker.hasPerms(guildId, 'manageRoles')) return 'Manage Roles'
          break
        case PunishmentType.Kick:
          if (!this.worker.hasPerms(guildId, 'kick')) return 'Kick Members'
          break
        case PunishmentType.Ban:
          if (!this.worker.hasPerms(guildId, 'ban')) return 'Ban Members'
          break
      }
      return false
    }
    return true
  }

  async punish (guild: Snowflake, user: Snowflake, roles: Snowflake[]): Promise<void> {
    const db = await this.config(guild)

    if (!db.punishment.type) return

    let punish = await this.db.findOne({ guild, user })

    if (!punish) {
      punish = {
        guild, user, warnings: []
      }
    }

    punish.warnings.push(Date.now())
    if (db.punishment.expires) {
      punish.warnings = punish.warnings.filter(x => Date.now() < (x + (db.punishment.expires ?? 0)))
    }

    if (punish.warnings.length >= db.punishment.amount) {
      switch (db.punishment.type) {
        case PunishmentType.Mute:
          void this.mute(guild, user, roles)
          break
        case PunishmentType.Kick:
          void this.kick(guild, user, roles)
          break
        case PunishmentType.Ban:
          void this.ban(guild, user, roles)
          break
      }

      await this.db.deleteOne({ guild, user })
    } else {
      await this.db.updateOne({ guild, user }, {
        $set: punish
      }, {
        upsert: true
      })
    }
  }

  async sendLog (positive: boolean, guild: Snowflake, user: Snowflake, type: string, extra?: string): Promise<void> {
    const db = await this.config(guild)
    if (!db.log || !db.id || !this.worker.responses.canLog(db.id, db.log)) return

    await this.worker.api.messages.send(db.log, new Embed()
      .color(positive ? 0x2ECC71 : 0xE74C3C)
      .title(`User ${type}`)
      .description(`<@${user}> ${positive ? '' : `reached ${db.punishment.amount} warnings.`}${extra ? `\n\n${extra}` : ''}`)
      .timestamp()
    )
  }

  async mute (guild: Snowflake, user: Snowflake, roles: Snowflake[]): Promise<void> {
    const db = await this.config(guild)
    if (!db.punishment.role || !this.worker.guildRoles.get(guild)?.has(db.punishment.role)) throw new NonFatalError('No muted role has been set')

    if (this.worker.isManageable(guild, user, roles, false)) {
      if (db.punishment.retainRoles) {
        await this.members.edit(guild, user, {
          roles: [db.punishment.role]
        })
      } else {
        await this.members.addRole(guild, user, db.punishment.role).catch(() => {})
      }

      await this.sendLog(false, guild, user, 'Muted', `Received <@&${db.punishment.role}>${db.punishment.time ? `\nWill be unmuted in ${(db.punishment.time / 60000).toLocaleString()} minutes` : ''}`)
    
      if (db.punishment.time) {
        await this.timeouts.add(guild, user, PunishmentType.Mute, Date.now() + db.punishment.time,
          db.punishment.retainRoles ? roles?.filter(x => x !== db.punishment.role) : undefined
        )
      }
    } else {
      await this.sendLog(false, guild, user, 'Muted', '(Though the user was unable to be muted due to permissions)')
    }
  }

  async unmute (guild: Snowflake, user: Snowflake, extra: boolean, roles?: Snowflake[]): Promise<void> {
    const db = await this.config(guild)
    if (!db.punishment.role) return

    if (db.punishment.retainRoles && roles) {
      const current = await this.worker.api.members.get(guild, user)
      if (!current) return

      await this.worker.api.members.edit(guild, user, {
        roles: Array.from(new Set(roles.concat(current.roles))).filter(x => x !== db.punishment.role)
      }).catch(() => {})
    } else {
      await this.members.removeRole(guild, user, db.punishment.role).catch(() => {})
    }

    await this.timeouts.remove(guild, user)

    void this.sendLog(true, guild, user, 'Unmuted', extra ? 'Manually unmuted.' : `After ${(db.punishment.time ?? 0) / 60000} minutes`)
  }

  async kick (guild: Snowflake, user: Snowflake, roles: Snowflake[]): Promise<void> {
    if (this.worker.isManageable(guild, user, roles)) {
      await this.members.kick(guild, user, 'Reached max warnings')

      await this.sendLog(false, guild, user, 'Kicked')
    } else {
      await this.sendLog(false, guild, user, 'Kicked', '(Though the user was unable to be kicked due to permissions)')
    }
  }

  async ban (guild: Snowflake, user: Snowflake, roles: Snowflake[]): Promise<void> {
    const db = await this.config(guild)

    if (this.worker.isManageable(guild, user, roles)) {
      await this.members.ban(guild, user, {
        reason: 'Reached max warnings.'
      })

      await this.sendLog(false, guild, user, 'Banned', db.punishment.time ? `Will be unbanned in ${(db.punishment.time / 60000).toLocaleString()} minutes` : '')

      if (db.punishment.time) {
        await this.timeouts.add(guild, user, PunishmentType.Ban, Date.now() + db.punishment.time)
      }
    } else {
      await this.sendLog(false, guild, user, 'Banned', '(Though the user was unable to be banned due to permissions)')
    }
  }

  async unban (guild: Snowflake, user: Snowflake): Promise<void> {
    const db = await this.config(guild)

    await this.members.unban(guild, user).catch(() => {})

    await this.timeouts.remove(guild, user)

    await this.sendLog(true, guild, user, 'Unbanned', `After ${(db.punishment.time ?? 0) / 60000} minutes`)
  }
}
