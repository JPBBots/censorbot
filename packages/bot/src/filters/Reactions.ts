import { CensorMethods, ExceptionType } from '@censorbot/typings'
import { BaseFilterHandler } from './Base'
import { Event } from '@jpbberry/typed-emitter'
import { DiscordEventMap } from 'jadl'
import { isBitOn } from '@censorbot/utils'

export class ReactionsFilterHandler extends BaseFilterHandler {
  @Event('MESSAGE_REACTION_ADD')
  async onReaction(reaction: DiscordEventMap['MESSAGE_REACTION_ADD']) {
    if (
      !reaction.guild_id ||
      !reaction.member ||
      !reaction.member.user ||
      reaction.member.user.bot
    )
      return

    if (this.worker.isCustom(reaction.guild_id)) return

    const channel =
      this.worker.channels.get(reaction.channel_id) ??
      (reaction.guild_id
        ? this.worker.getThreadParent(reaction.guild_id, reaction.channel_id)
        : undefined)

    if (!channel) return

    const db = await this.worker.db.config(reaction.guild_id)

    if (
      !isBitOn(db.censor, CensorMethods.Reactions) ||
      this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        roles: reaction.member.roles,
        channel: channel.id
      })
    )
      return

    const res = this.test(reaction.emoji.name ?? '', db, {
      roles: reaction.member.roles,
      channel: reaction.channel_id
    })

    if (!res) return

    if (
      !this.worker.hasPerms(
        reaction.guild_id,
        'manageMessages',
        reaction.channel_id
      )
    )
      return

    await this.worker.requests.deleteAllReactions(
      reaction.channel_id,
      reaction.message_id,
      reaction.emoji.id ?? reaction.emoji.name ?? ''
    )

    void this.worker.responses.log(
      CensorMethods.Reactions,
      reaction.emoji.name ?? '',
      reaction,
      res,
      db
    )

    if (
      !this.worker.isExcepted(ExceptionType.Punishment, db.exceptions, {
        roles: reaction.member.roles,
        channel: reaction.channel_id
      }) &&
      isBitOn(db.punishments.allow, res.type)
    ) {
      void this.worker.punishments
        .punish(
          reaction.guild_id,
          reaction.member.user.id,
          reaction.member.roles
        )
        .catch(() => {})
    }
  }
}
