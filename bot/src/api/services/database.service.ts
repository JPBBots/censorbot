import { Injectable } from '@nestjs/common'
import { Database } from '../../structures/Database'
import { ThreadService } from './thread.service'

@Injectable()
export class DatabaseService extends Database {
  constructor(_comms: ThreadService) {
    super(_comms)
  }
}
