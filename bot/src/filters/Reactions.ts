import { WorkerManager } from '../managers/Worker'

import { GatewayMessageReactionAddDispatchData } from 'discord-api-types'

import { CensorMethods, PunishmentType } from 'typings/api'

export async function ReactionHandler (worker: WorkerManager, reaction: GatewayMessageReactionAddDispatchData): Promise<void> {
  if (
    !reaction.guild_id ||
    !reaction.member ||
    !reaction.member.user ||
    reaction.member.user.bot
  ) return

  const db = await worker.db.config(reaction.guild_id)

  if (
    (db.censor & CensorMethods.Reactions) === 0 ||
    reaction.member.roles.some(role => db.role?.includes(role))
  ) return

  const res = worker.filter.test(reaction.emoji.name ?? '', db)

  if (!res.censor) return

  await worker.api.messages.deleteAllReactions(reaction.channel_id, reaction.message_id, reaction.emoji.id ?? reaction.emoji.name ?? '')

  if (db.log) void worker.responses.log(CensorMethods.Reactions, reaction.emoji.name ?? '', reaction, res, db.log)

  if (db.punishment.type !== PunishmentType.Nothing) {
    switch (db.punishment.type) {
      case PunishmentType.Mute:
        if (!worker.hasPerms(reaction.guild_id, 'manageRoles')) return
        break
      case PunishmentType.Kick:
        if (!worker.hasPerms(reaction.guild_id, 'kick')) return
        break
      case PunishmentType.Ban:
        if (!worker.hasPerms(reaction.guild_id, 'ban')) return
        break
    }
  }

  void worker.punishments.punish(reaction.guild_id, reaction.member.user.id, reaction.member.roles)
}
