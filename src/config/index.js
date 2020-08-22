module.exports = {
  guild: '399688888739692552',
  owner: '142408079177285632',
  defaultMsg: 'You\'re not allowed to say that...',
  ignoreFirstPrefixServers: ['264445053596991498'],
  deleteCommands: ['ticket'],
  channels: {
    serverCount: '512369661849894947',
    status: '450444337357258772',
    ticket: '691690998115467274',
    ticketLog: '691694111060918272'
  },
  emojis: {
    yes: '466027045021941761',
    no: '466027079536738304'
  },
  dashOptions: {
    guildCacheWipeTimeout: 15 * 60 * 1000, // 15 minutes
    requiredPermissionBit: 0x00000008 // Administrator
  },

  //

  shardsPerCluster: 5,

  //

  id: process.env.ID,
  prefix: [`<@${process.env.ID}> `, `<@!${process.env.ID}> `],
  support: 'https://discord.gg/CRAbk4w',
  patreon: 'https://patreon.com/censorbot',
  website: 'https://censor.bot',
  dashboard: 'https://dash.censor.bot',
  inviteSite: 'https://censor.bot/invite',

  //

  token: process.env.BOT_TOKEN,
  dbl: process.env.DBL_TOKEN !== 'none' ? process.env.DBL_TOKEN : null,
  oauth: {
    id: process.env.ID,
    secret: process.env.OAUTH_TOKEN,
    mysecret: process.env.OAUTH_MYSECRET
  },
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  },

  webhooks: { // TEMPORARY, WILL BE REMOVED IN WEBHOOKS/LOGGING REWRITE
    guilds: {
      id: process.env.GUILDS_ID,
      token: process.env.GUILDS_TOKEN
    }
  }
}
