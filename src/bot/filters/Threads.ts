import { Event } from '@jpbberry/typed-emitter'
import { CensorMethods, ExceptionType } from 'typings'
import { DiscordEventMap } from 'jadl'
import { isBitOn } from '../utils/bit'
import { BaseFilterHandler } from './Base'

export class ThreadsFilterHandler extends BaseFilterHandler {
  NAME_REPLACEMENT = 'Inappropriate Name'
  @Event('THREAD_CREATE')
  @Event('THREAD_UPDATE')
  async onThread(thread: DiscordEventMap['THREAD_CREATE' | 'THREAD_UPDATE']) {
    if (!('guild_id' in thread) || !thread.guild_id || !thread.name) return
    if (this.worker.isCustom(thread.guild_id)) return

    const db = await this.worker.db.config(thread.guild_id)

    if (
      !isBitOn(db.censor, CensorMethods.Threads) ||
      this.worker.isExcepted(ExceptionType.Everything, db.exceptions, {
        channel: thread.parent_id!
      })
    )
      return

    if (thread.name === this.NAME_REPLACEMENT) return

    const res = this.test(thread.name, db, {
      channel: thread.parent_id!
    })

    if (!res) return

    if (!this.worker.hasPerms(thread.guild_id, 'manageThreads', thread.id))
      return

    await this.worker.requests.editChannel(thread.id, {
      name: this.NAME_REPLACEMENT
    })

    void this.worker.responses.log(
      CensorMethods.Threads,
      thread.name,
      thread.id,
      res,
      db
    )
  }
}
