import Joi from 'joi'

import { PunishmentLevel, PunishmentType } from '@censorbot/typings'

import { SnowflakeString, enumArray } from './common'

export const punishmentLevelSchema = Joi.object<PunishmentLevel>({
  type: Joi.valid(...enumArray(PunishmentType)).required(),

  amount: Joi.number().min(1).max(20).required(),

  role: SnowflakeString,

  time: Joi.number()
    .max(5259600000)
    .allow(null)
    .required()
    .when('type', {
      is: PunishmentType.Timeout,
      then: Joi.number().max(2419000000)
    })
})
