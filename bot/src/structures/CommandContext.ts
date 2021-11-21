import { APIMessage } from 'discord-api-types'
import {
  CommandContext as cm,
  SlashCommandContext as scm,
  MessageTypes
} from 'discord-rose'
import { GuildDB } from 'typings/api'

export class CommandContext extends cm {
  db: GuildDB
  test = true

  async send(data: MessageTypes): Promise<APIMessage> {
    if (this.db?.dm) return await this.dm(data)

    return await super.send(data)
  }

  async reply(
    data: MessageTypes,
    mention = false,
    ephermal: boolean = false
  ): Promise<APIMessage> {
    if (this.db?.dm) return await this.dm(data)

    return await super.reply(data, mention)
  }

  async dm(data: MessageTypes): Promise<APIMessage> {
    void this.react('📬')
    return await super.dm(data)
  }
}

export class SlashCommandContext extends scm {
  db: GuildDB

  async send(data: MessageTypes, ephermal: boolean = false): Promise<null> {
    return await super.send(data, this.db?.dm || ephermal)
  }

  async reply(
    data: MessageTypes,
    mention: boolean = false,
    ephermal: boolean = false
  ): Promise<null> {
    return await super.send(data, this.db?.dm || ephermal)
  }

  async dm(data: MessageTypes): Promise<any> {
    return await super.send(data, true)
  }
}
