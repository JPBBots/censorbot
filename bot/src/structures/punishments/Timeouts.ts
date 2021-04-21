import { Snowflake } from 'discord-api-types'
import { Collection } from 'mongodb'
import { PunishmentType, TimedPunishments } from 'typings'
import { PunishmentManager } from './PunishmentManager'

import { guildShard } from 'discord-rose/dist/utils/UtilityFunctions'

import DJSCollection from '@discordjs/collection'

interface TimeoutSchema {
  guild: Snowflake
  user: Snowflake
  at: number
  type: TimedPunishments
}

export class Timeouts {
  timeouts: DJSCollection<string, NodeJS.Timeout> = new DJSCollection()

  interval = setInterval(() => {
    void this.checkTimeouts()
  }, 15e4)

  constructor (public manager: PunishmentManager) {}

  get db (): Collection<TimeoutSchema> {
    return this.manager.worker.db.collection('times')
  }

  private async execute (guild: Snowflake, user: Snowflake, type: TimedPunishments): Promise<void> {
    this.timeouts.delete(`${user}-${guild}`)

    switch (type) {
      case PunishmentType.Ban:
        void this.manager.unban(guild, user)
        break
      case PunishmentType.Mute:
        void this.manager.unmute(guild, user)
        break
    }
  }

  public async checkTimeouts (): Promise<void> {
    const timeouts = await this.db.find({ at: { $lt: Date.now() + 30e4 } }).toArray()

    timeouts
      .filter(x => this.manager.worker.shards.has(guildShard(x.guild, this.manager.worker.options.shards)))
      .filter(x => !this.timeouts.has(`${x.user}-${x.guild}`))
      .forEach(timeout => {
        console.debug(`Setting ${timeout.user}-${timeout.guild}`)
        this.timeouts.set(`${timeout.user}-${timeout.guild}`, setTimeout(() => {
          void this.execute(timeout.guild, timeout.user, timeout.type)
        }, timeout.at - Date.now()))
      })
  }

  public async add (guild: Snowflake, user: Snowflake, type: TimedPunishments, at: number): Promise<void> {
    await this.db.updateOne({
      guild, user
    }, {
      $set: {
        guild,
        user,
        type,
        at
      }
    }, {
      upsert: true
    })

    const timeout = this.timeouts.get(`${user}-${guild}`)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(`${user}-${guild}`)
    }
  }

  public async remove (guild: Snowflake, user: Snowflake): Promise<void> {
    await this.db.deleteOne({ guild, user })

    const timeout = this.timeouts.get(`${user}-${guild}`)

    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(`${user}-${guild}`)
    }
  }
}
