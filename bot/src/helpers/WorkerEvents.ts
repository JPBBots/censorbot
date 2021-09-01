import { Event, ExtendedEmitter } from '@jpbberry/typed-emitter'
import { DiscordEventMap, Embed, Snowflake } from 'discord-rose'
import Wait from '../utils/Wait'

import { WorkerManager } from '../managers/Worker'
import { PunishmentType } from 'typings'

export class WorkerEvents extends ExtendedEmitter {
  unavailables: Set<Snowflake> = new Set()

  constructor (private readonly worker: WorkerManager) {
    super()

    this.worker.comms.on('START', () => {
      this.worker.cacheManager.on('GUILD_CREATE', (guild) => {
        if (guild.threads) {
          guild.threads.forEach(thread => {
            if (!thread.guild_id || !thread.parent_id) return

            this.worker.threads.set(`${thread.guild_id}-${thread.id}`, {
              id: thread.id,
              guildId: thread.guild_id,
              parentId: thread.parent_id
            })
          })
        }
      })
    })
  }

  @Event('GUILD_CREATE')
  async newGuild (guild: DiscordEventMap['GUILD_CREATE']): Promise<void> {
    if (this.unavailables.has(guild.id)) {
      this.unavailables.delete(guild.id)

      return
    }

    await Wait(2000)

    const links = this.worker.config.links
    if (guild.system_channel_id) {
      if (!this.worker.hasPerms(guild.id, 'sendMessages', guild.system_channel_id)) return
      if (!this.worker.hasPerms(guild.id, 'embed', guild.system_channel_id)) return void this.worker.api.messages.send(guild.system_channel_id, 'Missing `Embed Links` permission. This will likely cause issues with the functionality of the bot.')

      const perms = this.worker.config.requiredPermissions.filter(x => x.vital && !this.worker.hasPerms(guild.id, x.permission))
      const embed = new Embed()
        .color(this.worker.responses.color)
        .title('Thanks for inviting Censor Bot!')
        .field('Enjoy!', `The dashboard: ${links.dashboard}\n[Website](${links.site}) | [Support](${links.support})`)

      if (perms.length > 0) embed.field('Missing a few permissions!', `Some vital permissions are missing:\n${perms.map(x => `\`${x.name}\``).join(', ')}\nType +permissions to see why we need them and recheck them.`)
      else embed.field('Permissions', 'To debug and check your permissions run `+debug`')

      void this.worker.api.messages.send(guild.system_channel_id, embed)
    }
  }

  @Event('THREAD_CREATE')
  threadCreated (thread: DiscordEventMap['THREAD_CREATE']): void {
    if (!thread.guild_id || !thread.parent_id) return

    this.worker.threads.set(`${thread.guild_id}-${thread.id}`, {
      id: thread.id,
      guildId: thread.guild_id,
      parentId: thread.parent_id
    })
  }

  @Event('THREAD_DELETE')
  threadDeleted (thread: DiscordEventMap['THREAD_DELETE']): void {
    if (!thread.guild_id || !thread.parent_id) return

    this.worker.threads.delete(`${thread.guild_id}-${thread.id}`)
  }

  @Event('THREAD_LIST_SYNC')
  threadListSync (threads: DiscordEventMap['THREAD_LIST_SYNC']): void {
    threads.threads.forEach(thread => {
      if (!thread.parent_id) return

      this.worker.threads.set(`${threads.guild_id}-${thread.id}`, {
        id: thread.id,
        guildId: threads.guild_id,
        parentId: thread.parent_id
      })
    })
  }

  @Event('READY')
  handleReady (): void {
    void this.worker.punishments.timeouts.checkTimeouts()

    if (this.worker.config.custom.allowedGuilds) {
      this.worker.guilds.forEach(guild => {
        if (!this.worker.config.custom.allowedGuilds?.includes(guild.id)) {
          void this.worker.api.guilds.leave(guild.id)
        }
      })
    }
  }

  @Event('GUILD_UNAVAILABLE')
  guildUnavailable (guild: DiscordEventMap['GUILD_UNAVAILABLE'][0]): void {
    this.unavailables.add(guild?.id)
  }

  @Event('GUILD_CREATE')
  handleCustomOnlyGuild (guild: DiscordEventMap['GUILD_CREATE']): void {
    if (this.worker.config.custom.allowedGuilds && !this.worker.config.custom.allowedGuilds.includes(guild.id)) {
      void this.worker.api.guilds.leave(guild.id)
    }
  }

  @Event('GUILD_MEMBER_UPDATE')
  async handleManualUnmute (member: DiscordEventMap['GUILD_MEMBER_UPDATE']): Promise<void> {
    if (!member.user) return

    const db = await this.worker.db.config(member.guild_id)

    if (!db.punishment.role || db.punishment.type !== PunishmentType.Mute) return

    if (member.roles.includes(db.punishment.role)) return

    const punishment = await this.worker.punishments.timeouts.db.findOne({ guild: member.guild_id, user: member.user.id })
    if (!punishment) return

    void this.worker.punishments.unmute(member.guild_id, member.user.id, true, punishment.roles)
  }

  @Event('GUILD_MEMBER_ADD')
  async handleMuteEvasion (member: DiscordEventMap['GUILD_MEMBER_ADD']): Promise<void> {
    if (!member.user) return

    const db = await this.worker.db.config(member.guild_id)

    if (!db.punishment.role || db.punishment.type !== PunishmentType.Mute) return

    const punishment = await this.worker.punishments.timeouts.db.findOne({ guild: member.guild_id, user: member.user.id })
    if (!punishment) return

    void this.worker.api.members.addRole(member.guild_id, member.user.id, db.punishment.role)
  }

  async updateGuild (guildId: Snowflake): Promise<void> {
    this.worker.comms.tell('GUILD_UPDATED', guildId)
  }

  @Event('GUILD_ROLE_CREATE')
  @Event('GUILD_ROLE_DELETE')
  @Event('GUILD_ROLE_UPDATE')
  @Event('CHANNEL_CREATE')
  @Event('CHANNEL_DELETE')
  @Event('CHANNEL_UPDATE')
  onGuildPartUpdate (roleOrChannel: DiscordEventMap[
    'GUILD_ROLE_CREATE' |
    'GUILD_ROLE_DELETE' |
    'GUILD_ROLE_UPDATE' |
    'CHANNEL_CREATE' |
    'CHANNEL_DELETE' |
    'CHANNEL_UPDATE'
  ]): void {
    if (roleOrChannel.guild_id) void this.updateGuild(roleOrChannel.guild_id)
  }

  @Event('GUILD_UPDATE')
  onGuildUpdate (guild: DiscordEventMap['GUILD_UPDATE']): void {
    void this.updateGuild(guild.id)
  }

  // Filter handlers

  @Event('MESSAGE_CREATE')
  @Event('MESSAGE_UPDATE')
  filterMessage (message: DiscordEventMap['MESSAGE_CREATE' | 'MESSAGE_UPDATE']): void {
    void this.worker.methods.msg(this.worker, message)
  }

  @Event('GUILD_MEMBER_UPDATE')
  @Event('GUILD_MEMBER_ADD')
  filterName (member: DiscordEventMap['GUILD_MEMBER_UPDATE' | 'GUILD_MEMBER_ADD']): void {
    void this.worker.methods.names(this.worker, member)
  }

  @Event('MESSAGE_REACTION_ADD')
  filterReaction (reaction: DiscordEventMap['MESSAGE_REACTION_ADD']): void {
    void this.worker.methods.react(this.worker, reaction)
  }
}
