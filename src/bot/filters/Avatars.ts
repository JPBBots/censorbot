import { Event } from '@jpbberry/typed-emitter'
import { DiscordEventMap } from 'jadl'
import { BaseFilterHandler } from './Base'

import { CensorMethods, ExceptionType, FilterType } from '@censorbot/typings'
import { isBitOn } from '../utils/bit'

export class AvatarsFilterHandler extends BaseFilterHandler {
  @Event('GUILD_MEMBER_ADD')
  async onMemberUpdate(member: DiscordEventMap['GUILD_MEMBER_ADD']) {
    if (
      !member.user ||
      !member.user.avatar ||
      !this.worker.hasPerms(member.guild_id, 'kick') ||
      !this.worker.isManageable(member.guild_id, member.user!.id, member.roles)
    )
      return

    const db = await this.worker.db.config(member.guild_id)

    if (
      isBitOn(db.censor, CensorMethods.Avatars) ||
      this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        roles: member.roles
      })
    )
      return

    const avatarUrl = this.worker.api.cdn.avatar(
      member.user.id,
      member.user.avatar,
      {
        extension: 'png'
      }
    )

    const res = await this.worker.images.test(avatarUrl)
    if (res.bad) {
      await this.worker.requests.kickMember(member.guild_id, member.user.id)
      await this.worker.responses.log(
        CensorMethods.Avatars,
        '',
        member,
        {
          type: FilterType.Images,
          percentage: res.percent
        },
        db
      )
    }
  }
}
