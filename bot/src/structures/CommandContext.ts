import { APIMessage } from 'discord-api-types'
import { CommandContext as cm, MessageTypes } from 'discord-rose'
import { GuildDB } from 'typings/api'

export class CommandContext extends cm {
  db: GuildDB
  test = true

  async send (data: MessageTypes): Promise<APIMessage> {
    if (this.db?.dm) return await this.dm(data)

    return await super.send(data)
  }

  async reply (data: MessageTypes, mention?: boolean): Promise<APIMessage> {
    if (this.db?.dm) return await this.dm(data)

    return await super.reply(data, mention)
  }

  async dm (data: MessageTypes): Promise<APIMessage> {
    void this.react('📬')
    return await super.dm(data)
  }
}
