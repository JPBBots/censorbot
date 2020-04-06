module.exports = {
  base: true,
  languages: ['en', 'es', 'off'],
  censor: {
    msg: true,
    emsg: true,
    nick: true,
    react: true
  },
  log: null,
  role: null,
  filter: [],
  uncensor: [],
  pop_delete: 3000,
  msg: null,
  punishment: {
    type: 0,
    amount: 3,
    role: null
  },
  webhook: false,
  webhook_replace: 0,
  channels: [],
  multi: false
}

/**
 * Webhook replace
 * @typedef {Number} WebhookReplace
 * @example
 * 0: ||Spoilers||
 * 1: h#shtags
 */

/**
 * Guild Settings database
 * @typedef {Object} GuildDB
 * @property {Boolean} base=true Whether base filter is on or not
 * @property {Languages} languages Array of languages for base filter to use
 * @property {Object} censor Censor methods
 * @property {Boolean} censor.msg=true Whether to censor messages
 * @property {Boolean} censor.emsg=true Whether to censor edited messages
 * @property {Boolean} censor.nick=true Whether to censor nicknames
 * @property {Boolean} censor.react=true Whether to censor reactions
 * @property {?Snowflake} log=null ID of log channel
 * @property {?Snowflake} role=null ID of uncensor role
 * @property {Array} filter=[] Array of words to censor in this server
 * @property {Array} uncensor=[] Array of words to not censor in this server
 * @property {?Number|Boolean} pop_delete=3000 Amount of time in ms to wait before deleting pop message
 * @property {?String|Boolean} msg=null Message contained in pop message
 * @property {Object} punishment Punishment settings
 * @property {PunishmentType} punishment.type=0 Type of punishment
 * @property {Number} punishment.amount=3 Amount of warnings til punish
 * @property {?Snowflake} punishment.role=null Role to give for muting
 * @property {Boolean} webhook=false Whether to resend as webhook
 * @property {WebhookReplace} webhook_replace=0 How to replace curses in webhooks
 * @property {Array.<Snowflake>} channels=[] Array of channels to not censor in
 * @property {Boolean} multi=false Whether to use multi-line
 */
