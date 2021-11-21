import { Injectable } from '@nestjs/common'
import { Database } from '../../structures/Database'

@Injectable()
export class DatabaseService extends Database {}
