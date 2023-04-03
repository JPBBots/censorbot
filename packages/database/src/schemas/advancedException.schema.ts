import Joi from 'joi'

import { AdvancedException, ExceptionType } from '@censorbot/typings'

import { enumArray, nullableSnowflake } from './common'

export const advancedExceptionSchema = Joi.object<AdvancedException>({
  channel: nullableSnowflake,
  role: nullableSnowflake,
  type: Joi.valid(...enumArray(ExceptionType)).required()
})
