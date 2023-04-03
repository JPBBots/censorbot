import { Injectable } from '@nestjs/common'
import { Filter } from '@censorbot/filter'

@Injectable()
export class FilterService extends Filter {}
