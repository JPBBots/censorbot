import { Config } from '../config'
import { Database } from '../structures/Database'

export async function Setup (Extension: any) {
  Extension.config = Config
  Extension.db = new Database()
  await Extension.db.connect()
}
