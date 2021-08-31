import { Cache } from '@jpbberry/cache'
import { Injectable } from '@nestjs/common'
import { Snowflake } from 'discord-rose'
import { User } from 'typings'
import { Config } from '../../config'

@Injectable()
export class CacheService {
  users: Cache<Snowflake, User> = new Cache(Config.dashboardOptions.wipeTimeout)
}
