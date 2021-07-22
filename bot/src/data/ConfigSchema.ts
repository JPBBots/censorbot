import Schema, { PropertyDefinition, SchemaDefinition } from 'validate'

import { CensorMethods, filters, PunishmentType, WebhookReplace } from 'typings'

const multipleTypes = (...types) => (val) => {
  if (val === undefined) return true
  return types.some(type => {
    if (type instanceof Object && val instanceof type) return true
    // eslint-disable-next-line valid-typeof
    return type === val || typeof val === type
  })
}

const simple = (type: Object, allowNull = false): any => {
  const obj = {
    type
  } as PropertyDefinition
  if (!allowNull) obj.use = { denyNull }

  return obj
}

const create = (fn: (val) => boolean): (val: any) => boolean => {
  return (val): boolean => {
    if (val === null) return true
    if (val === undefined) return true

    return fn(val)
  }
}

const denyNull = (val): boolean => val !== null

const denyDupes = create((val: string[]) => val.length === new Set(val).size)

const Snowflake = create((val: string) => /^[0-9]{15,}$/.test(val))

const ListValid = {
  type: Array,
  length: { max: 1500 },
  each: {
    type: String,
    length: { min: 1, max: 20 },
    use: { denyNull }
  }
} as PropertyDefinition

export const config = {
  filters: {
    type: Array,
    each: { type: String, enum: filters },
    use: { denyNull, denyDupes }
  },
  censor: {
    type: Number,
    size: { min: 0, max: CensorMethods.Messages | CensorMethods.Names | CensorMethods.Reactions }
  },
  log: {
    type: String,
    use: { Snowflake }
  },
  role: {
    type: Array,
    each: {
      type: String,
      use: { Snowflake }
    }
  },
  filter: ListValid,
  uncensor: ListValid,
  phrases: ListValid,
  msg: {
    content: {
      length: { max: 1000 },
      use: { is: multipleTypes('string', false, null) }
    },
    deleteAfter: {
      type: Number,
      size: { min: 1, max: 600e3 }
    },
    dm: simple(Boolean)
  },
  punishment: {
    properties: {
      type: {
        type: Number,
        enum: [PunishmentType.Ban, PunishmentType.Kick, PunishmentType.Mute, PunishmentType.Nothing],
        use: { denyNull }
      },
      amount: {
        type: Number,
        size: { min: 1, max: 50 },
        use: { denyNull }
      },
      role: {
        type: String,
        use: { Snowflake }
      },
      time: {
        type: Number,
        size: { min: 1, max: 5184000000 }
      },
      expires: {
        type: Number,
        size: { min: 1, max: 5184000000 }
      },
      ignored: {
        type: Array,
        each: {
          type: String,
          use: { Snowflake }
        }
      },
      retainRoles: simple(Boolean)
    }
  },
  webhook: {
    enabled: simple(Boolean),
    separate: simple(Boolean),
    replace: {
      type: Number,
      enum: [WebhookReplace.Hashtags, WebhookReplace.Spoilers, WebhookReplace.Stars]
    },
    ignored: {
      type: Array,
      each: {
        type: String,
        use: { Snowflake }
      }
    }
  },
  multi: simple(Boolean),
  prefix: {
    type: String,
    length: { max: 10 }
  },
  channels: [{
    type: String,
    use: { Snowflake }
  }],
  nsfw: simple(Boolean),
  invites: simple(Boolean),
  toxicity: simple(Boolean),
  images: simple(Boolean),
  ocr: simple(Boolean),
  dm: simple(Boolean),
  antiHoist: simple(Boolean)
} as SchemaDefinition

export const schema = new Schema(config)

schema.message({
  denyNull: path => `${path} cannot be null.`,
  Snowflake: path => `${path} is not a valid ID`,
  denyDupes: path => `${path} cannot have duplicate elements`
})
