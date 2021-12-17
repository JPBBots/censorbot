import { REST } from '@discordjs/rest'
import { Injectable } from '@nestjs/common'
import { Config } from '../../config'
import { Requests } from '../../managers/Requests'

@Injectable()
export class DiscordService extends Requests {
  constructor() {
    super(new REST().setToken(Config.token))
  }
}
