import { Injectable } from '@nestjs/common'
import { Thread } from 'jadl'
import { EmbedWithSendback, parseMessage } from '@jadl/builders'
import Config from '@censorbot/config'

@Injectable()
export class ThreadService extends Thread {
  webhook(wh: keyof typeof Config.webhooks) {
    const webhook = Config.webhooks[wh]
    return new EmbedWithSendback(async (embed) => {
      return await this.sendCommand('SEND_WEBHOOK', {
        id: webhook.id,
        token: webhook.token,
        data: parseMessage(embed) as any
      }).catch(() => null as any)
    })
  }
}
