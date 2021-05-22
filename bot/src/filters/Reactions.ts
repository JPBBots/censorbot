import { WorkerManager } from '../managers/Worker'

import { GatewayMessageReactionAddDispatchData } from 'discord-api-types'

import { CensorMethods } from 'typings/api'

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

  if (!worker.hasPerms(reaction.guild_id, 'manageMessages', reaction.channel_id)) return

  await worker.api.messages.deleteAllReactions(reaction.channel_id, reaction.message_id, reaction.emoji.id ?? reaction.emoji.name ?? '')

  void worker.responses.log(CensorMethods.Reactions, reaction.emoji.name ?? '', reaction, res, db)

  if (!worker.punishments.checkPerms(reaction.guild_id, db)) {
    void worker.punishments.punish(reaction.guild_id, reaction.member.user.id, reaction.member.roles)
  }
}
