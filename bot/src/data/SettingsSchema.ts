import Joi, { ValidationError } from 'joi'
import {
  GuildDB,
  CensorMethods,
  PunishmentType,
  WebhookReplace,
  Exception,
  ExceptionType,
  PunishmentLevel
} from 'typings'
import { allFilterTypes, BASE_FILTERS } from 'typings/filter'

const sfRegex = /^[0-9]{5,50}$/

const SnowflakeString = Joi.string()
  .regex(sfRegex)
  .error((errs) => {
    return new ValidationError('Not a Snowflake', errs[0], errs[0])
  })

const nullableSnowflake = SnowflakeString.concat(Joi.string().allow(null))

export const PremiumOnly = (type: any): Joi.Schema =>
  Joi.valid(type).error(
    (errs) => new ValidationError('This is premium only!', errs[0], errs[0])
  )

export const exceptionSchema = Joi.object<Exception>({
  channel: nullableSnowflake,
  role: nullableSnowflake,
  type: Joi.valid(
    ExceptionType.Everything,
    ExceptionType.PreBuiltFilter,
    ExceptionType.ServerFilter,
    ExceptionType.Punishment,
    ExceptionType.Resend,
    ExceptionType.Response,
    ExceptionType.Invites,
    ExceptionType.AntiHoist
  ).required()
})

export const punishmentLevelSchema = Joi.object<PunishmentLevel>({
  type: Joi.valid(
    PunishmentType.GiveRole,
    PunishmentType.Kick,
    PunishmentType.Ban,
    PunishmentType.Timeout
  ).required(),

  amount: Joi.number().min(1).max(20).required(),

  role: SnowflakeString,

  time: Joi.number()
    .max(86400000 * 60)
    .allow(null)
    .required()
})

export const settingSchema = Joi.object<GuildDB>({
  id: SnowflakeString,

  filters: Joi.array().items(...BASE_FILTERS),

  exceptions: Joi.array().items(exceptionSchema).max(15),

  censor: Joi.number()
    .min(0)
    .max(
      Object.values<number>(
        CensorMethods as unknown as Record<string, number>
      ).reduce((a, b) => a | b, 0)
    ),

  nickReplace: Joi.string().max(32),

  removeNick: Joi.bool(),

  log: nullableSnowflake,

  filter: Joi.array().items(Joi.string().max(20)).max(150),

  uncensor: Joi.array().items(Joi.string().max(20)).max(150),

  phrases: Joi.array().items(Joi.string().max(50)).max(150),

  words: Joi.array().items(Joi.string().max(20)).max(150),

  antiHoist: Joi.bool(),

  msg: Joi.object<GuildDB['msg']>({
    content: Joi.string().max(200).allow(null, false),

    deleteAfter: Joi.number().allow(false).max(120e3),

    dm: PremiumOnly(false)
  }),

  punishments: Joi.object<GuildDB['punishments']>({
    expires: Joi.number()
      .max(86400000 * 60)
      .allow(null),
    levels: Joi.array().items(punishmentLevelSchema).max(5),
    allow: Joi.number()
      .min(0)
      .max(allFilterTypes + 1)
  }),

  webhook: Joi.object<GuildDB['webhook']>({
    enabled: PremiumOnly(false),
    separate: PremiumOnly(true),
    replace: PremiumOnly(WebhookReplace.Spoilers)
  }),

  multi: PremiumOnly(false),
  prefix: Joi.string().allow(null),

  nsfw: Joi.bool(),

  invites: Joi.bool(),

  dm: PremiumOnly(false),

  toxicity: PremiumOnly(false),
  images: PremiumOnly(false),
  ocr: PremiumOnly(false),
  phishing: Joi.bool()
})

const boolOverride = Joi.valid(Joi.override, true, false)

export const premiumSchema = settingSchema.concat(
  Joi.object({
    dm: boolOverride,

    filter: Joi.array().max(1500),
    uncensor: Joi.array().max(1500),
    phrases: Joi.array().max(1000),

    exceptions: Joi.array().max(100),

    webhook: Joi.object<GuildDB['webhook']>({
      enabled: boolOverride,
      separate: boolOverride,
      replace: Joi.valid(
        Joi.override,
        WebhookReplace.Spoilers,
        WebhookReplace.Hashtags,
        WebhookReplace.Stars
      )
    }),

    punishments: Joi.object({
      levels: Joi.array().max(20)
    }),

    msg: Joi.object({
      content: Joi.string().max(1000),

      deleteAfter: Joi.number().max(600e3),

      dm: boolOverride
    }),

    multi: boolOverride,

    toxicity: boolOverride,
    images: boolOverride,
    ocr: boolOverride
  })
)
