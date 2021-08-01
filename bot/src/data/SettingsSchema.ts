import Joi, { ValidationError } from 'joi'
import { GuildDB, filters, CensorMethods, PunishmentType, WebhookReplace } from 'typings'

const sfRegex = /^[0-9]{5,50}$/

const SnowflakeString = Joi.string()
  .regex(sfRegex)
  .error((errs) => {
    return new ValidationError('Not a Snowflake', errs[0], errs[0])
  })

const nullableSnowflake = SnowflakeString.concat(Joi.string()
  .allow(null)
)

export const PremiumOnly = (type: any): Joi.Schema => Joi.valid(type).error((errs) => new ValidationError('This is premium only!', errs[0], errs[0]))

export const punishmentSchema = Joi.object({
  type: Joi.valid(PunishmentType.Nothing, PunishmentType.Mute, PunishmentType.Kick, PunishmentType.Ban)
    .required(),

  amount: Joi.number()
    .min(1)
    .max(20)
    .required(),

  role: nullableSnowflake.concat(Joi.string()
    .required()
  ),

  time: Joi.number()
    .max(86400000 * 60)
    .allow(null)
    .required(),

  expires: Joi.number()
    .max(86400000 * 60)
    .allow(null)
    .required(),

  retainRoles: false
})

export const settingSchema = Joi.object<GuildDB>({
  id: SnowflakeString,

  filters: Joi.array()
    .items(...filters),

  censor: Joi.number()
    .min(0)
    .max(Object.values<number>(CensorMethods as unknown as Record<string, number>).reduce((a, b) => a | b, 0)),

  log: nullableSnowflake,

  role: Joi.array()
    .items(SnowflakeString)
    .max(4),

  filter: Joi.array()
    .items(Joi.string().max(20))
    .max(150),

  uncensor: Joi.array()
    .items(Joi.string().max(20))
    .max(150),

  phrases: Joi.array()
    .items(Joi.string().max(50))
    .max(150),

  antiHoist: Joi.bool(),

  msg: Joi.object({
    content: Joi.string()
      .max(200)
      .allow(null, false),

    deleteAfter: Joi.number()
      .allow(null, false)
      .max(120),

    dm: PremiumOnly(false)
  }),

  punishment: punishmentSchema,

  webhook: Joi.object({
    enabled: PremiumOnly(false),
    separate: PremiumOnly(true),
    replace: PremiumOnly(WebhookReplace.Spoilers)
  }),

  multi: PremiumOnly(false),
  prefix: Joi.string().allow(null),

  channels: Joi.array()
    .items(SnowflakeString)
    .max(5),

  nsfw: Joi.bool(),

  invites: Joi.bool(),

  dm: PremiumOnly(false),

  toxicity: PremiumOnly(false),
  images: PremiumOnly(false),
  ocr: PremiumOnly(false)
})

const boolOverride = Joi.valid(Joi.override, true, false)

export const premiumSchema = settingSchema.concat(Joi.object({
  dm: boolOverride,

  filter: Joi.array().max(1500),
  uncensor: Joi.array().max(1500),
  phrases: Joi.array().max(1000),

  webhook: Joi.object({
    enabled: boolOverride,
    separate: boolOverride,
    replace: Joi.valid(Joi.override, WebhookReplace.Spoilers, WebhookReplace.Hashtags, WebhookReplace.Stars)
  }),

  punishment: Joi.object({
    retainRoles: boolOverride
  }),

  msg: Joi.object({
    content: Joi.string().max(1000),

    deleteAfter: Joi.number().max(600),

    dm: boolOverride
  }),

  multi: boolOverride,

  role: Joi.array().max(Number.MAX_SAFE_INTEGER),
  channels: Joi.array().max(Number.MAX_SAFE_INTEGER),

  toxicity: boolOverride,
  images: boolOverride,
  ocr: boolOverride
}))
