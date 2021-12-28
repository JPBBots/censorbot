import { WorkerManager } from '../managers/Worker'

import { GatewayMessageReactionAddDispatchData } from 'discord-api-types'

import { CensorMethods, ExceptionType } from 'typings/api'

export async function ReactionHandler(
  worker: WorkerManager,
  reaction: GatewayMessageReactionAddDispatchData
): Promise<void> {
  if (
    !reaction.guild_id ||
    !reaction.member ||
    !reaction.member.user ||
    reaction.member.user.bot
  )
    return

  const channel =
    worker.channels.get(reaction.channel_id) ??
    (reaction.guild_id
      ? worker.getThreadParent(reaction.guild_id, reaction.channel_id)
      : undefined)

  if (!channel) return

  const db = await worker.db.config(reaction.guild_id)

  if (
    (db.censor & CensorMethods.Reactions) === 0 ||
    worker.isExcepted(ExceptionType.Everything, db, {
      roles: reaction.member.roles,
      channel: channel.id
    })
  )
    return

  const res = worker.test(reaction.emoji.name ?? '', db, {
    roles: reaction.member.roles,
    channel: reaction.channel_id
  })

  if (!res.censor) return

  if (
    !worker.hasPerms(reaction.guild_id, 'manageMessages', reaction.channel_id)
  )
    return

  await worker.requests.deleteAllReactions(
    reaction.channel_id,
    reaction.message_id,
    reaction.emoji.id ?? reaction.emoji.name ?? ''
  )

  void worker.responses.log(
    CensorMethods.Reactions,
    reaction.emoji.name ?? '',
    reaction,
    res,
    db
  )

  if (
    !worker.isExcepted(ExceptionType.Punishment, db, {
      roles: reaction.member.roles,
      channel: reaction.channel_id
    })
  ) {
    void worker.punishments
      .punish(reaction.guild_id, reaction.member.user.id, reaction.member.roles)
      .catch()
  }
}
