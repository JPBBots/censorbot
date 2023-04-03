import { REST } from '@discordjs/rest'
import { Injectable } from '@nestjs/common'
import Config from '@censorbot/config'
import { Requests } from '@censorbot/utils'

@Injectable()
export class DiscordService extends Requests {
  constructor() {
    super(new REST().setToken(Config.token))
  }
}
