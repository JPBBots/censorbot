import DotEnv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { PermissionsUtils } from 'discord-rose'

if (!process.env.BOT_TOKEN) {
  const env = DotEnv.parse(fs.readFileSync(path.resolve(__dirname, '../../.env')))
  Object.keys(env).forEach(key => {
    process.env[key] = env[key]
  })
}

export const Config = {
  id: process.env.ID as string,
  token: process.env.BOT_TOKEN as string,
  db: {
    host: process.env.DB_HOST as string,
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string
  },

  oauth: {
    mySecret: process.env.OAUTH_MYSECRET as string,
    secret: process.env.OAUTH_TOKEN as string
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
    permission: keyof typeof PermissionsUtils.bits
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

  actionRetention: 3,

  dashboardOptions: {
    guildCacheWipeTimeout: 15 * 60 * 1000, // 15 minutes
    requiredPermission: 'manageGuild' as keyof typeof PermissionsUtils.bits,
    scopes: ['identify', 'guilds']
  },

  custom: {
    on: Boolean(process.env.CUSTOM),
    lock: Boolean(process.env.LOCK_COMMANDS),
    allowedGuilds: process.env.ALLOWED_GUILDS?.split(','),
    status: process.env.CUSTOM_STATUS?.split(',') as ['playing' | 'streaming' | 'listening' | 'watching' | 'competing', string]
  },

  ai: {
    predictionMin: 0.85, // 85%
    cacheWipe: 10 * 60 * 100, // 10 minutes
    perspectiveKey: process.env.PERSPECTIVE_KEY,
    antiNsfwKey: process.env.ANTI_NSFW_KEY
  }
}
