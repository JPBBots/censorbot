import Collection from '@discordjs/collection'

import { Snowflake } from 'discord-api-types'

import { GuildDB } from '../../../typings/typings'

import { WorkerManager } from '../managers/Worker'

import wait from '../utils/Wait'

interface DeleteBucket {
  msgs: Snowflake[]
  amount: number
  running: boolean
  timeout?: NodeJS.Timeout
}

export class ActionBucket {
  messages: Collection<Snowflake, DeleteBucket> = new Collection()
  popups: Collection<string, true> = new Collection()

  constructor (public worker: WorkerManager) {}

  public async delete (channel: Snowflake, message: Snowflake[]): Promise<void> {
    let bucket = this.messages.get(channel)
    if (!bucket) {
      bucket = {
        msgs: [],
        running: false,
        amount: 0
      }
    } else {
      clearTimeout(bucket.timeout as unknown as number)
    }

    if (bucket.amount <= this.worker.config.bucketBuffer) {
      await this.worker.api.messages.bulkDelete(channel, message)
        .catch(() => {})

      bucket.amount++
      bucket.timeout = setTimeout(() => {
        this.messages.delete(channel)
      }, 15000)

      this.messages.set(channel, bucket)
    }

    if (Array.isArray(message)) {
      bucket.msgs.push(...message)
    } else bucket.msgs.push(message)

    if (bucket.running) {
      this.messages.set(channel, bucket)

      return
    }

    bucket.running = true
    this.messages.set(channel, bucket)

    setTimeout(() => {
      this._executeDelete(channel)
    }, 2000)
  }

  private _executeDelete (channel: Snowflake): void {
    const bucket = this.messages.get(channel)
    if (!bucket) return
    this.messages.delete(channel)

    this.worker.api.messages.bulkDelete(channel, bucket.msgs)
      .catch(() => {})
  }

  public popup (channel: Snowflake, user: Snowflake, db: GuildDB): void {
    const id = `${channel}-${user}`
    if (this.popups.has(id)) return

    this.popups.set(id, true)

    this.worker.responses.popup(channel, user, db.msg.content === null ? this.worker.config.defaultMessage : db.msg.content as string)
      .then(async msg => {
        if (!db.msg.deleteAfter) {
          await wait(5000)
          return this.popups.delete(id)
        }
        await wait(db.msg.deleteAfter)
        this.worker.api.messages.delete(channel, msg.id).catch(() => {})
        this.popups.delete(id)
      }).catch(() => {})
  }
}
