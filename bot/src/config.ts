import DotEnv from 'dotenv'
import path from 'path'
import fs from 'fs'

if (!process.env.BOT_TOKEN) {
  const env = DotEnv.parse(fs.readFileSync(path.resolve(__dirname, '../../censorbottesting.env')))
  Object.keys(env).forEach(key => {
    process.env[key] = env[key]
  })
}

export const Config = {
  token: process.env.BOT_TOKEN,
  db: {
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  },

  links: {
    site: 'https://censor.bot',
    invite: 'https://censor.bot/invite',
    dashboard: 'https://dash.censor.bot',
    support: 'https://discord.gg/CRAbk4w',
    patreon: 'https://patreon.com/censorbot'
  }
}
