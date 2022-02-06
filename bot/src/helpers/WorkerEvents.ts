import { Event } from '@jpbberry/typed-emitter'
import { DiscordEventMap, Shard, Snowflake } from 'jadl'
import { Embed } from '@jadl/embed'
import Wait from '../utils/Wait'

import { WorkerManager } from '../managers/Worker'
import { PunishmentLevel, PunishmentType } from 'typings'
import { TimeoutSchema } from '../structures/punishments/Timeouts'
import { EventAdder } from '../utils/EventAdder'

export class WorkerEvents extends EventAdder<WorkerManager> {
  unavailables: Set<Snowflake> = new Set()

  constructor(private readonly worker: WorkerManager) {
    super(worker)

    this.worker.comms.on('START', () => {
      this.worker.cacheManager.on('GUILD_CREATE', (guild) => {
        if (guild.threads) {
          guild.threads.forEach((thread) => {
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

  @Event('SHARD_READY')
  statusUpdates(shard: Shard) {
    this.worker.comms.tell('STATUS_UPDATE', null)

    if (!shard.eventNames().includes('CLOSED')) {
      shard.on('CLOSED', () => {
        this.worker.comms.tell('STATUS_UPDATE', null)
      })

      shard.on('RESUMED', () => {
        this.worker.comms.tell('STATUS_UPDATE', null)
      })
    }
  }

  @Event('GUILD_CREATE')
  async newGuild(guild: DiscordEventMap['GUILD_CREATE']): Promise<void> {
    if (this.unavailables.has(guild.id)) {
      this.unavailables.delete(guild.id)

      return
    }

    await Wait(2000)

    const links = this.worker.config.links
    if (guild.system_channel_id) {
      if (
        !this.worker.hasPerms(guild.id, 'sendMessages', guild.system_channel_id)
      )
        return
      if (!this.worker.hasPerms(guild.id, 'embed', guild.system_channel_id))
        return void this.worker.requests.sendMessage(
          guild.system_channel_id,
          'Missing `Embed Links` permission. This will likely cause issues with the functionality of the bot.'
        )

      const perms = this.worker.config.requiredPermissions.filter(
        (x) => x.vital && !this.worker.hasPerms(guild.id, x.permission)
      )
      const embed = new Embed()
        .color(this.worker.responses.color)
        .title('Thanks for inviting Censor Bot!')
        .field(
          'Enjoy!',
          `The dashboard: ${links.dashboard}\n[Website](${links.site}) | [Support](${links.support})`
        )

      if (perms.length > 0)
        embed.field(
          'Missing a few permissions!',
          `Some vital permissions are missing:\n${perms
            .map((x) => `\`${x.name}\``)
            .join(
              ', '
            )}\nType +permissions to see why we need them and recheck them.`
        )
      else
        embed.field(
          'Permissions',
          'To debug and check your permissions run `+debug`'
        )

      void this.worker.requests.sendMessage(guild.system_channel_id, embed)
    }
  }

  @Event('THREAD_CREATE')
  threadCreated(thread: DiscordEventMap['THREAD_CREATE']): void {
    if (!thread.guild_id || !thread.parent_id) return

    this.worker.threads.set(`${thread.guild_id}-${thread.id}`, {
      id: thread.id,
      guildId: thread.guild_id,
      parentId: thread.parent_id
    })
  }

  @Event('THREAD_DELETE')
  threadDeleted(thread: DiscordEventMap['THREAD_DELETE']): void {
    if (!thread.guild_id || !thread.parent_id) return

    this.worker.threads.delete(`${thread.guild_id}-${thread.id}`)
  }

  @Event('THREAD_LIST_SYNC')
  threadListSync(threads: DiscordEventMap['THREAD_LIST_SYNC']): void {
    threads.threads.forEach((thread) => {
      if (!thread.parent_id) return

      this.worker.threads.set(`${threads.guild_id}-${thread.id}`, {
        id: thread.id,
        guildId: threads.guild_id,
        parentId: thread.parent_id
      })
    })
  }

  @Event('READY')
  handleReady(): void {
    void this.worker.punishments.timeouts.checkTimeouts()

    if (this.worker.config.custom.allowedGuilds) {
      this.worker.guilds.forEach((guild) => {
        if (!this.worker.config.custom.allowedGuilds?.includes(guild.id)) {
          void this.worker.requests.leaveGuild(guild.id)
        }
      })
    }
  }

  @Event('GUILD_UNAVAILABLE')
  guildUnavailable(guild: DiscordEventMap['GUILD_UNAVAILABLE'][0]): void {
    this.unavailables.add(guild?.id)
  }

  @Event('GUILD_CREATE')
  handleCustomOnlyGuild(guild: DiscordEventMap['GUILD_CREATE']): void {
    if (
      this.worker.config.custom.allowedGuilds &&
      !this.worker.config.custom.allowedGuilds.includes(guild.id)
    ) {
      void this.worker.requests.leaveGuild(guild.id)
    }
  }

  @Event('GUILD_MEMBER_UPDATE')
  async handleManualUnmute(
    member: DiscordEventMap['GUILD_MEMBER_UPDATE']
  ): Promise<void> {
    if (this.worker.isCustom(member.guild_id)) return
    if (!member.user) return

    const db = await this.worker.db.config(member.guild_id)

    const punishments = db.punishments.levels.filter(
      (x) =>
        x.type === PunishmentType.GiveRole && !member.roles.includes(x.role)
    ) as Array<PunishmentLevel & { type: PunishmentType.GiveRole }>

    if (!punishments.length) return

    const punishment = (await this.worker.punishments.timeouts.db.findOne({
      guild: member.guild_id,
      user: member.user.id,
      type: PunishmentType.GiveRole,
      role: {
        $in: punishments.map((x) => x.role)
      }
    })) as TimeoutSchema & { type: PunishmentType.GiveRole }
    if (!punishment) return

    void this.worker.punishments.removeRole(
      member.guild_id,
      member.user.id,
      punishment.role,
      true
    )
  }

  @Event('GUILD_MEMBER_ADD')
  async handleMuteEvasion(
    member: DiscordEventMap['GUILD_MEMBER_ADD']
  ): Promise<void> {
    if (this.worker.isCustom(member.guild_id)) return
    if (!member.user) return

    const punishment = (await this.worker.punishments.timeouts.db.findOne({
      guild: member.guild_id,
      user: member.user.id,
      type: PunishmentType.GiveRole
    })) as TimeoutSchema & { type: PunishmentType.GiveRole }
    if (!punishment) return

    void this.worker.requests.addRole(
      member.guild_id,
      member.user.id,
      punishment.role,
      { reason: 'User had role before leaving' }
    )
  }

  async updateGuild(guildId: Snowflake): Promise<void> {
    this.worker.comms.tell('GUILD_UPDATED', guildId)
  }

  @Event('GUILD_ROLE_CREATE')
  @Event('GUILD_ROLE_DELETE')
  @Event('GUILD_ROLE_UPDATE')
  @Event('CHANNEL_CREATE')
  @Event('CHANNEL_DELETE')
  @Event('CHANNEL_UPDATE')
  onGuildPartUpdate(
    roleOrChannel: DiscordEventMap[
      | 'GUILD_ROLE_CREATE'
      | 'GUILD_ROLE_DELETE'
      | 'GUILD_ROLE_UPDATE'
      | 'CHANNEL_CREATE'
      | 'CHANNEL_DELETE'
      | 'CHANNEL_UPDATE']
  ): void {
    if (this.worker.isCustom(roleOrChannel.guild_id)) return
    if (roleOrChannel.guild_id) void this.updateGuild(roleOrChannel.guild_id)
  }

  @Event('GUILD_UPDATE')
  onGuildUpdate(guild: DiscordEventMap['GUILD_UPDATE']): void {
    void this.updateGuild(guild.id)
  }

  commands = [
    'help',
    'debug',
    'ticket',
    'support',
    'invite',
    'help',
    'dashboard',
    'dash'
  ]

  @Event('MESSAGE_CREATE')
  async command(msg: DiscordEventMap['MESSAGE_CREATE']) {
    if (this.worker.isCustom(msg.guild_id)) return
    if (!msg.guild_id) return

    const config = await this.worker.db.config(msg.guild_id)

    if (config.prefix && !msg.content.startsWith(config.prefix)) return

    if (
      this.commands.some((a) =>
        [config.prefix].some(
          (b) =>
            msg.content.startsWith(`${b}${a}`) ||
            msg.content.startsWith(`${b} ${a}`)
        )
      )
    ) {
      if (
        !this.worker.hasPerms(
          msg.guild_id,
          ['sendMessages', 'embed'],
          msg.channel_id
        )
      )
        return

      void this.worker.requests.sendMessage(msg.channel_id, {
        embeds: [
          new Embed()
            .title("We've moved to Slash Commands")
            .description(
              'All commands are now exclusively slash commands, type / to see the available commands.'
            )
            .render()
        ]
      })
    }
  }
}
