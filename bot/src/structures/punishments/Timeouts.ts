import { Snowflake } from 'discord-api-types'
import { Collection } from 'mongodb'
import { PunishmentType, TimedPunishments } from 'typings'
import { PunishmentManager } from './PunishmentManager'

import DJSCollection from '@discordjs/collection'

interface TimeoutSchema {
  guild: Snowflake
  user: Snowflake
  at: number
  type: TimedPunishments
  roles?: Snowflake[]
}

export class Timeouts {
  timeouts: DJSCollection<string, NodeJS.Timeout> = new DJSCollection()

  interval = setInterval(() => {
    void this.checkTimeouts()
  }, 15e4)

  constructor (public manager: PunishmentManager) {}

  get db (): Collection<TimeoutSchema> {
    return this.manager.worker.db.collection('timeouts')
  }

  private async execute (guild: Snowflake, user: Snowflake, type: TimedPunishments, roles?: Snowflake[]): Promise<void> {
    this.timeouts.delete(`${user}-${guild}`)

    switch (type) {
      case PunishmentType.Ban:
        void this.manager.unban(guild, user)
        break
      case PunishmentType.Mute:
        void this.manager.unmute(guild, user, false, roles)
        break
    }
  }

  public async checkTimeouts (): Promise<void> {
    const timeouts = await this.db.find({ at: { $lt: Date.now() + 30e4 } }).toArray()

    timeouts
      .filter(x => this.manager.worker.guilds.has(x.guild))
      .filter(x => !this.timeouts.has(`${x.user}-${x.guild}`))
      .forEach(timeout => {
        this._create(timeout)
      })
  }

  private _create (timeout: TimeoutSchema): void {
    this.timeouts.set(`${timeout.user}-${timeout.guild}`, setTimeout(() => {
      void this.execute(timeout.guild, timeout.user, timeout.type, timeout.roles)
    }, timeout.at - Date.now()))
  }

  public async add (guild: Snowflake, user: Snowflake, type: TimedPunishments, at: number, roles?: Snowflake[]): Promise<void> {
    const time = {
      guild,
      user,
      type,
      at,
      roles
    }
    await this.db.updateOne({
      guild, user
    }, {
      $set: time
    }, {
      upsert: true
    })

    const timeout = this.timeouts.get(`${user}-${guild}`)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(`${user}-${guild}`)
    }

    if (time.at < Date.now() + 30e4) {
      this._create(time)
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
