import { Injectable } from '@nestjs/common'
import { CustomBotOptions } from '@censorbot/typings'
import { Database } from '../../structures/Database'
import { ThreadService } from './thread.service'
import { FilterService } from './filter.service'

@Injectable()
export class DatabaseService extends Database {
  constructor(comms: ThreadService, public filter: FilterService) {
    super(comms, filter)

    comms.on('UPDATE_CUSTOM_BOTS', async () => await this.updateCustomBots())
    comms.on('UPDATE_FILTER', async () => await this.updateFilters())

    this.on('started', () => {
      void this.updateCustomBots()

      void this.updateFilters()
    })
  }

  customBots: CustomBotOptions[] = []

  public async updateFilters() {
    const entries = await this.collection('filter_data').find({}).toArray()

    this.filter.import(entries)
  }

  async updateCustomBots() {
    this.customBots = await this.collection('custombots').find({}).toArray()
  }
}
