import Joi, { CustomValidator, ValidationError } from 'joi'
import {
  GuildDB,
  CensorMethods,
  PunishmentType,
  WebhookReplace,
  Exception,
  ExceptionType,
  PunishmentLevel,
  BASE_FILTERS,
  FilterType,
  FilterSettings
} from '@jpbbots/cb-typings'
import { enumCombiner } from '../utils/enumCombiner'

const enumArray = (enumObj: any) =>
  Object.values(enumObj).filter((x) => typeof x === 'number')

const sfRegex = /^[0-9]{5,50}$/

const bitWise = (
  enumObj: any,
  premiumBits?: number[]
): CustomValidator<number> => {
  const full = enumCombiner(enumObj)
  return (value, helpers) => {
    if (value < 0 || value > full) {
      return helpers.error('not.bitwise')
    }

    if (premiumBits?.some((x) => (value & x) !== 0)) {
      return helpers.error('not.premium')
    }

    return value
  }
}

const SnowflakeString = Joi.string()
  .regex(sfRegex)
  .error((errs) => {
    return new ValidationError('Not a Snowflake', errs[0], errs[0])
  })

const nullableSnowflake = SnowflakeString.concat(Joi.string().allow(null))

const premiumValidate = (
  nonPremium: Joi.SchemaLike,
  premium: Joi.SchemaLike,
  start: Joi.Schema | typeof Joi = Joi
): Joi.Schema =>
  start.when('premium', {
    switch: [
      {
        is: false,
        then: nonPremium
      },
      { is: true, then: premium }
    ]
  })

const premiumMax = <T extends 'string' | 'array' | 'number'>(
  type: T,
  nonPremium: number,
  premium: number
): ReturnType<typeof Joi[T]> =>
  premiumValidate(
    Joi[type]().max(nonPremium),
    Joi[type]().max(premium),
    Joi[type]()
  ) as any

const premiumBoolean = premiumValidate(Joi.valid(false), Joi.bool())

export const exceptionSchema = Joi.object<Exception>({
  channel: nullableSnowflake,
  role: nullableSnowflake,
  type: Joi.valid(...enumArray(ExceptionType)).required()
})

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

export const settingSchema = Joi.object<GuildDB & { premium: boolean }>({
  premium: Joi.bool().required(),

  id: SnowflakeString,

  filter: premiumValidate(
    Joi.object(),
    Joi.object<FilterSettings>({
      server: Joi.array().max(1500),
      uncensor: Joi.array().max(1500),
      words: Joi.array().max(1500),
      phrases: Joi.array().max(1500)
    }),
    Joi.object<FilterSettings>({
      base: Joi.array()
        .items(...BASE_FILTERS)
        .unique(),
      server: Joi.array().items(Joi.string().max(20)).max(150),
      uncensor: Joi.array().items(Joi.string().max(20)).max(150),
      words: Joi.array().items(Joi.string().max(20)).max(150),
      phrases: Joi.array().items(Joi.string().max(20)).max(150)
    })
  ),

  channels: premiumMax('array', 5, 999).items(SnowflakeString),
  roles: premiumMax('array', 5, 999).items(SnowflakeString),

  exceptions: premiumMax('array', 5, 100).items(exceptionSchema),

  censor: premiumValidate(
    Joi.number().custom(bitWise(CensorMethods, [CensorMethods.Avatars])),
    Joi.number().custom(bitWise(CensorMethods))
  ),

  nickReplace: Joi.string().max(32),

  removeNick: Joi.bool(),

  log: nullableSnowflake,

  antiHoist: Joi.bool(),

  msg: premiumValidate(
    Joi.object(),
    Joi.object({
      content: Joi.string().max(1000),
      deleteAfter: Joi.number().max(600e3)
    }),
    Joi.object<GuildDB['msg']>({
      content: Joi.string().max(200).allow(null, false),

      deleteAfter: Joi.number().max(120e3).allow(false),

      dm: premiumBoolean
    })
  ),

  punishments: premiumValidate(
    Joi.object(),
    Joi.object({
      levels: Joi.array().max(20)
    }),
    Joi.object<GuildDB['punishments']>({
      expires: Joi.number()
        .max(2629800000 * 2)
        .allow(null),
      levels: Joi.array().items(punishmentLevelSchema).max(5),
      allow: Joi.number().custom(bitWise(FilterType)),
      log: nullableSnowflake
    })
  ),

  webhook: premiumValidate(
    Joi.object<GuildDB['webhook']>({
      enabled: false,
      separate: true,
      replace: WebhookReplace.Spoilers
    }),
    Joi.object<GuildDB['webhook']>({
      enabled: Joi.bool(),
      separate: Joi.bool(),
      replace: Joi.number().valid(...enumArray(WebhookReplace))
    })
  ),

  multi: premiumValidate(Joi.valid(false), Joi.bool()),
  prefix: Joi.string().allow(null),

  nsfw: Joi.bool(),

  invites: Joi.bool(),

  dm: premiumBoolean,

  toxicity: premiumBoolean,
  images: premiumBoolean,
  ocr: premiumBoolean,
  phishing: Joi.bool()
}).messages({
  'not.bitwise': 'Not a valid BitWise value!',
  'not.premium': 'This is premium only!'
})
