import DotEnv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { bits } from 'discord-rose/dist/utils/Permissions'

if (!process.env.BOT_TOKEN) {
  const env = DotEnv.parse(fs.readFileSync(path.resolve(__dirname, '../../censorbottesting.env')))
  Object.keys(env).forEach(key => {
    process.env[key] = env[key]
  })
}
// (['manageMessages', 'manageNicknames', 'manageRoles', 'kick', 'ban', 'webhooks']).fil
export const Config = {
  token: process.env.BOT_TOKEN as string,
  db: {
    host: process.env.DB_HOST as string,
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string
  },

  requiredPermissions: [
    {
      permission: 'sendMessages',
      name: 'Send Messages',
      why: 'To send messages',
      vital: true
    },
    {
      permission: 'embed',
      name: 'Embed Links',
      why: 'To send embeds like this one!',
      vital: true
    },
    {
      permission: 'manageMessages',
      name: 'Manage Messages',
      why: 'To delete messages and message reactions',
      vital: true
    },
    {
      permission: 'manageNicknames',
      name: 'Manage Nicknames',
      why: 'To remove innapropriate nicknames',
      vital: true
    },
    {
      permission: 'manageRoles',
      name: 'Manage Roles',
      why: 'To distribute muted roles with punishments'
    },
    {
      permission: 'kick',
      name: 'Kick Members',
      why: 'To kick members with punishments'
    },
    {
      permission: 'ban',
      name: 'Ban Members',
      why: 'To ban members with punishments'
    },
    {
      permission: 'webhooks',
      name: 'Manage Webhooks',
      why: 'To create resend webhooks (premium)'
    }
  ] as Array<{
    permission: keyof typeof bits
    name: string
    why: string
    vital?: boolean
  }>,

  links: {
    site: 'https://censor.bot',
    invite: 'https://censor.bot/invite',
    dashboard: 'https://dash.censor.bot',
    support: 'https://discord.gg/CRAbk4w',
    patreon: 'https://patreon.com/censorbot'
  },

  defaultMessage: "You're not allowed to say that.",

  actionRetention: 3
}
