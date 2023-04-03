import { Snowflake } from 'jadl'

export interface PunishmentSchema {
  guild: Snowflake
  user: Snowflake
  warnings: number[]
}

export enum PunishmentType {
  GiveRole,
  Kick,
  Ban,
  Timeout
}
export type TimedPunishments =
  | PunishmentType.Ban
  | PunishmentType.GiveRole
  | PunishmentType.Timeout

export type PunishmentLevel = {
  amount: number
} & (
  | {
      type: PunishmentType.Ban
      time: number | null
    }
  | {
      type: PunishmentType.GiveRole
      role: Snowflake
      time: number | null
    }
  | {
      type: PunishmentType.Timeout
      time: number
    }
  | {
      type: PunishmentType.Kick
    }
)

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
