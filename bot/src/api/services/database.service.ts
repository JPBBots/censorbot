import { Injectable } from '@nestjs/common'
import { CustomBotOptions } from '@jpbbots/cb-typings'
import { Database } from '../../structures/Database'
import { ThreadService } from './thread.service'

@Injectable()
export class DatabaseService extends Database {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(comms: ThreadService) {
    super(comms)

    comms.on('UPDATE_CUSTOM_BOTS', async () => await this.updateCustomBots())

    this.on('started', () => {
      void this.updateCustomBots()
    })
  }

  customBots: CustomBotOptions[] = []

  async updateCustomBots() {
    this.customBots = await this.collection('custombots').find({}).toArray()
  }
}
