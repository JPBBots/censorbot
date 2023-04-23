import DotEnv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { PermissionUtils } from 'jadl'
import { OAuth2Scopes, Snowflake } from 'discord-api-types/v9'

if (!process.env.BOT_TOKEN) {
  const env = DotEnv.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../.env'))
  )
  Object.keys(env).forEach((key) => {
    process.env[key] = env[key]
  })
}

const staging = Boolean(process.env.STAGING)

function generateWebhook(wh: string): { id: Snowflake; token: string } {
  const [id, token] = process.env[`WH_${wh.toUpperCase()}`]?.split(',') as [
    Snowflake,
    string
  ]

  return { id, token }
}

const Config = {
  id: process.env.ID as string,
  dbl: process.env.DBL_TOKEN as string,
  token: process.env.BOT_TOKEN as string,
  db: {
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string
  },

  owners: ['142408079177285632'],

  trialLength: 259200000,

  staging,
  dev: process.env.DEV === 'true',

  adminGuild: staging ? '569907007465848842' : '399688888739692552',

  channels: staging
    ? {
        tickets: '841417190635732992'
      }
    : {
        tickets: '691690998115467274'
      },

  emojis: {
    yes: '466027045021941761',
    no: '466027079536738304'
  },

  chargebee: {
    key: process.env.CHARGEBEE as string,
    webhook: process.env.CHARGEBEE_WEBHOOK as string
  },

  oauth: {
    mySecret: process.env.OAUTH_MYSECRET as string,
    secret: process.env.OAUTH_TOKEN as string
  },

  requiredPermissions: [
    {
      permission: 'sendMessages',
      why: 'To send messages',
      vital: true
    },
    {
      permission: 'embed',
      why: 'To send embeds like this one!',
      vital: true
    },
    {
      permission: 'manageMessages',
      why: 'To delete messages and message reactions',
      vital: true
    },
    {
      permission: 'manageNicknames',
      why: 'To remove inappropriate nicknames',
      vital: true
    },
    {
      permission: 'manageThreads',
      why: 'To remove innapropriate thread names'
    },
    {
      permission: 'manageRoles',
      why: 'To distribute muted roles with punishments'
    },
    {
      permission: 'kick',
      why: 'To kick members with punishments'
    },
    {
      permission: 'ban',
      why: 'To ban members with punishments'
    },
    {
      permission: 'moderateMembers',
      why: 'To timeout users with punishments'
    },
    {
      permission: 'webhooks',
      why: 'To create resend webhooks (premium)'
    }
  ] as Array<{
    permission: keyof typeof PermissionUtils.bits
    why: string
    vital?: boolean
  }>,

  links: {
    site: 'https://censor.bot',
    invite: 'https://censor.bot/invite',
    dashboard: 'https://dash.censor.bot',
    support: 'https://discord.gg/CRAbk4w',
    terms: 'https://www.iubenda.com/terms-and-conditions/23592172',
    privacyPolicy: 'https://www.iubenda.com/privacy-policy/23592172/full-legal',
    premium: 'https://censor.bot/premium'
  },

  defaultMessage: "You're not allowed to say that.",

  webhooks: {
    tickets: generateWebhook('tickets'),
    ticketLog: generateWebhook('ticketLog'),
    errors: generateWebhook('errors'),
    premium: generateWebhook('premium')
  },

  actionRetention: 3,

  dashboardOptions: {
    wipeTimeout: 15 * 60 * 1000, // 15 minutes
    requiredPermission: 'manageGuild' as keyof typeof PermissionUtils.bits,
    scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
    port: Number(process.env.PORT)
  },

  custom: {
    on: Boolean(process.env.CUSTOM),
    lock: Boolean(process.env.LOCK_COMMANDS),
    allowedGuilds: process.env.ALLOWED_GUILDS?.split(','),
    status: process.env.CUSTOM_STATUS?.split(',') as [
      'playing' | 'streaming' | 'listening' | 'watching' | 'competing',
      string
    ]
  },

  ai: {
    predictionMin: 0.85, // 85%
    cacheWipe: 10 * 60 * 100, // 10 minutes
    perspectiveKey: process.env.PERSPECTIVE_KEY,
    antiNsfwKey: process.env.ANTI_NSFW_KEY,
    ocrToken: process.env.OCR_KEY as string
  }
}

export default Config
