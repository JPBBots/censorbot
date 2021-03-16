import { Config } from '../config'
import { Database } from '../structures/Database'

export async function Setup (Extension: any): Promise<void> {
  Extension.config = Config
  Extension.db = new Database()
  await Extension.db.connect()
}
