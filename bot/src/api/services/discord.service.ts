import { Injectable } from '@nestjs/common'
import { RestManager } from 'discord-rose'
import { Config } from '../../config'

@Injectable()
export class DiscordService extends RestManager {
  constructor () {
    super(Config.token)
  }
}
