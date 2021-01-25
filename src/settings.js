const isCustom = process.env.CUSTOM === 'true'

module.exports = {
  token: process.env.BOT_TOKEN,
  id: process.env.ID,
  dbl: process.env.DBL_TOKEN === 'none' ? null : process.env.DBL_TOKEN,
  shards: {
    perCluster: process.env.SHARDS_PER_CLUSTER ? Number(process.env.SHARDS_PER_CLUSTER) : null,
    total: process.env.SHARDS_TOTAL ? Number(process.env.SHARDS_TOTAL) : null
  },
  oauth: {
    id: process.env.ID,
    secret: process.env.OAUTH_TOKEN,
    mysecret: process.env.OAUTH_MYSECRET
  },
  db: {
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  },
  custom: {
    custom: isCustom,
    allowedGuilds: isCustom ? (process.env.ALLOWED_GUILDS ? process.env.ALLOWED_GUILDS.split(',') : false) : false,
    lockCommands: isCustom ? (process.env.LOCK_COMMANDS === 'true') : false,
    customStatus: isCustom ? (process.env.CUSTOM_STATUS ? process.env.CUSTOM_STATUS.split(',') : false) : false
  },
  webhooks: {},
  datadog: {
    key: process.env.DD_KEY
  }
}

Object.keys(process.env).forEach(env => {
  if (env.startsWith('WH_')) {
    const [id, token] = process.env[env].split(',')
    module.exports.webhooks[env.split('_')[1].toLowerCase()] = { id, token }
  }
})
