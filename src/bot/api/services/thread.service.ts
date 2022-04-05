import { Injectable } from '@nestjs/common'
import { Thread } from 'jadl'
import { Embed } from '@jadl/embed'
import { formatMessage } from '@jadl/cmd'
import { Config } from '../../config'

@Injectable()
export class ThreadService extends Thread {
  webhook(wh: keyof typeof Config.webhooks): Embed {
    const webhook = Config.webhooks[wh]
    return new Embed(async (embed) => {
      return await this.sendCommand('SEND_WEBHOOK', {
        id: webhook.id,
        token: webhook.token,
        data: formatMessage(embed).data as any
      }).catch(() => null as any)
    })
  }
}
