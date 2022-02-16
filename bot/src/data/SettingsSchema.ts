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
  FilterType
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

  time: Joi.number().max(2629800000).allow(null).required()
})

export const settingSchema = Joi.object<GuildDB & { premium: boolean }>({
  premium: Joi.bool().required(),

  id: SnowflakeString,

  filters: Joi.array().items(...BASE_FILTERS),

  exceptions: premiumMax('array', 15, 100).items(exceptionSchema),

  censor: premiumValidate(
    Joi.number().custom(bitWise(CensorMethods, [CensorMethods.Avatars])),
    Joi.number().custom(bitWise(CensorMethods))
  ),

  nickReplace: Joi.string().max(32),

  removeNick: Joi.bool(),

  log: nullableSnowflake,

  filter: premiumMax('array', 150, 1500).items(Joi.string().max(20)),

  uncensor: premiumMax('array', 150, 1500).items(Joi.string().max(20)),

  words: premiumMax('array', 150, 1500).items(Joi.string().max(20)),

  phrases: premiumMax('array', 150, 1000).items(Joi.string().max(50)),

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
      allow: Joi.number().custom(bitWise(FilterType))
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
