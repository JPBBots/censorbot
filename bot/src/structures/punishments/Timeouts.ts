import { Snowflake } from 'discord-api-types'
import { Collection } from 'mongodb'
import { PunishmentType, TimedPunishments } from 'typings'
import { PunishmentManager } from './PunishmentManager'

import DJSCollection from '@discordjs/collection'

export type TimeoutSchema = {
  guild: Snowflake
  user: Snowflake
  at: number
} & (
  | {
      type: PunishmentType.GiveRole
      role: Snowflake
    }
  | {
      type: PunishmentType.Ban
    }
)

export class Timeouts {
  timeouts: DJSCollection<string, NodeJS.Timeout> = new DJSCollection()

  interval = setInterval(() => {
    void this.checkTimeouts()
  }, 15e4)

  constructor(public manager: PunishmentManager) {}

  get db(): Collection<TimeoutSchema> {
    return this.manager.worker.db.collection('timeouts')
  }

  private async execute(timeout: TimeoutSchema): Promise<void> {
    this.timeouts.delete(`${timeout.user}-${timeout.guild}`)

    switch (timeout.type) {
      case PunishmentType.Ban:
        void this.manager.unban(timeout.guild, timeout.user)
        break
      case PunishmentType.GiveRole:
        void this.manager.removeRole(
          timeout.guild,
          timeout.user,
          timeout.role,
          false
        )
        break
    }
  }

  public async checkTimeouts(): Promise<void> {
    const timeouts = await this.db
      .find({ at: { $lt: Date.now() + 30e4 } })
      .toArray()

    timeouts
      .filter((x) => this.manager.worker.guilds.has(x.guild))
      .filter((x) => !this.timeouts.has(`${x.user}-${x.guild}`))
      .forEach((timeout) => {
        this._create(timeout)
      })
  }

  private _create(timeout: TimeoutSchema): void {
    this.timeouts.set(
      `${timeout.user}-${timeout.guild}`,
      setTimeout(() => {
        void this.execute(timeout)
      }, timeout.at - Date.now())
    )
  }

  public async add<Type extends TimedPunishments>(
    guild: Snowflake,
    user: Snowflake,
    type: Type,
    at: number,
    role?: Type extends PunishmentType.GiveRole
      ? Required<Snowflake>
      : undefined
  ): Promise<void> {
    const time = {
      guild,
      user,
      type,
      at,
      role
    } as TimeoutSchema

    await this.db.updateOne(
      {
        guild,
        user
      },
      {
        $set: time
      },
      {
        upsert: true
      }
    )

    const timeout = this.timeouts.get(`${user}-${guild}`)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(`${user}-${guild}`)
    }

    if (time.at < Date.now() + 30e4) {
      this._create(time)
    }
  }

  public async remove(guild: Snowflake, user: Snowflake): Promise<void> {
    await this.db.deleteOne({ guild, user })

    const timeout = this.timeouts.get(`${user}-${guild}`)

    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(`${user}-${guild}`)
    }
  }
}
