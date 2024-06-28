import {
  BASE_FILTERS,
  CensorMethods,
  FilterSettings,
  FilterType,
  GuildDB,
  Plugin,
  WebhookReplace
} from '@censorbot/typings'
import Joi from 'joi'
import {
  SnowflakeString,
  bitWise,
  enumArray,
  nullableSnowflake
} from './common'
import { advancedExceptionSchema } from './advancedException.schema'
import { punishmentLevelSchema } from './punishmentLevel.schema'

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

const premiumBoolean = premiumValidate(Joi.valid(false), Joi.bool())

export const premiumObject = <D extends any>(obj: {
  [key in keyof D]: Joi.SchemaLike | [Joi.SchemaLike, Joi.SchemaLike]
}) => {
  const pObject: any = {}
  const dObject: any = {}

  for (const key in obj) {
    const value = obj[key]

    if (Array.isArray(value)) {
      dObject[key] = value[0]
      pObject[key] = value[1]
    } else {
      dObject[key] = value
    }
  }

  return premiumValidate(Joi.object(), Joi.object(pObject), Joi.object(dObject))
}

export const settingSchema = Joi.object<GuildDB & { premium: boolean }>({
  premium: Joi.bool().required(),

  id: SnowflakeString,

  filter: premiumObject<FilterSettings>({
    base: Joi.array()
      .items(...BASE_FILTERS)
      .unique(),
    server: [
      Joi.array().items(Joi.string().max(20)).max(150),
      Joi.array().max(1500)
    ],
    uncensor: [
      Joi.array().items(Joi.string().max(20)).max(150),
      Joi.array().max(1500)
    ],
    words: [
      Joi.array().items(Joi.string().max(20)).max(150),
      Joi.array().max(1500)
    ],
    phrases: [
      Joi.array().items(Joi.string().max(20)).max(150),
      Joi.array().max(1500)
    ]
  }),
  exceptions: premiumObject<GuildDB['exceptions']>({
    nsfw: Joi.bool(),
    channels: [Joi.array().items(SnowflakeString).max(5), Joi.array().max(999)],
    roles: [Joi.array().items(SnowflakeString).max(5), Joi.array().max(999)],
    advanced: [
      Joi.array().items(advancedExceptionSchema).max(5),
      Joi.array().max(999)
    ]
  }),

  censor: premiumValidate(
    Joi.number().custom(bitWise(CensorMethods, [CensorMethods.Avatars])),
    Joi.number().custom(bitWise(CensorMethods))
  ),

  nickReplace: Joi.string().max(32),

  removeNick: Joi.bool(),

  log: nullableSnowflake,

  response: premiumObject<GuildDB['response']>({
    content: [Joi.string().allow(null, false).max(200), Joi.string().max(1000)],
    deleteAfter: [
      Joi.number().allow(false).max(120e3),
      Joi.number().max(600e3)
    ],
    dm: premiumBoolean
  }),

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

  resend: premiumValidate(
    Joi.object<GuildDB['resend']>({
      enabled: false,
      separate: true,
      replace: WebhookReplace.Spoilers
    }),
    Joi.object<GuildDB['resend']>({
      enabled: Joi.bool(),
      separate: Joi.bool(),
      replace: Joi.number().valid(...enumArray(WebhookReplace))
    })
  ),

  plugins: premiumValidate(
    Joi.number().custom(
      bitWise(Plugin, [
        Plugin.AntiNSFWImages,
        Plugin.MultiLine,
        Plugin.OCR,
        Plugin.Toxicity
      ])
    ),
    Joi.number().custom(bitWise(Plugin))
  ),

  prefix: Joi.string().allow(null),
  dm: premiumBoolean
}).messages({
  'not.bitwise': 'Not a valid BitWise value!',
  'not.premium': 'This is premium only!'
})
