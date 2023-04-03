import Joi, { CustomValidator, ValidationError } from 'joi'

import { isBitOn, enumCombiner } from '@censorbot/utils'

export const enumArray = (enumObj: any) =>
  Object.values(enumObj).filter((x) => typeof x === 'number')

export const sfRegex = /^[0-9]{5,50}$/

export const bitWise = (
  enumObj: any,
  premiumBits?: number[]
): CustomValidator<number> => {
  return (value, helpers) => {
    const full = enumCombiner(enumObj)
    if (value < 0 || value > full) {
      return helpers.error('not.bitwise')
    }

    if (premiumBits?.some((x) => isBitOn(value, x))) {
      return helpers.error('not.premium')
    }

    return value
  }
}

export const SnowflakeString = Joi.string()
  .regex(sfRegex)
  .error((errs) => {
    return new ValidationError('Not a Snowflake', errs[0] as any, errs[0])
  })

export const nullableSnowflake = SnowflakeString.concat(
  Joi.string().allow(null)
)
