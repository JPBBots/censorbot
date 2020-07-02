const config = {
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
  msg: {
    content: null,
    deleteAfter: 3000
  },
  punishment: {
    type: 0,
    amount: 3,
    role: null
  },
  webhook: {
    enabled: false,
    replace: 0,
    separate: false
  },
  channels: [],
  multi: false,
  prefix: '+',
  invites: false
}

const constants = {
  currentVersion: 3,
  allowedLanguages: ['en', 'es', 'off', 'ru', 'de'],
  punishmentTypes: [0, 1, 2, 3],
  webhookReplaces: [0, 1]
}

function generatePieces (obj) {
  const pieces = {}
  function generatePiece (toObj, key, working) {
    var val = key ? toObj[key] : toObj
    if (!val || val.constructor !== Object) {
      pieces[`${working ? `${working}.` : ''}${key}`] = val
    } else {
      Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
    }
  }
  generatePiece(obj, '')

  return pieces
}

const defaultPieces = generatePieces(config)

const verify = (obj, premium, guild) => {
  const configPieces = generatePieces(obj)

  const checker = (piece, bool, prem = false) =>
    Object.keys(configPieces).includes(piece) &&
    (prem ? premium : true) &&
    bool(configPieces[piece])
      ? configPieces[piece]
      : defaultPieces[piece]

  return {
    base: checker('base', (v) => typeof v === 'boolean'),
    languages: checker('languages', (v) =>
      v &&
      v.constructor === Array &&
      !v.some(a =>
        !constants.allowedLanguages.some(b => a === b) ||
        v.filter(x => x === a).length > 1
      )
    ),
    censor: {
      msg: checker('censor.msg', (v) => typeof v === 'boolean'),
      emsg: checker('censor.emsg', (v) => typeof v === 'boolean'),
      nick: checker('censor.nick', (v) => typeof v === 'boolean'),
      react: checker('censor.react', (v) => typeof v === 'boolean')
    },
    log: checker('log', (v) => guild.c.some(x => v === x.id)),
    role: checker('role', (v) => guild.r.some(x => v === x.id)),
    filter: checker('filter', (v) =>
      v &&
      v.constructor === Array &&
      !v.some(x =>
        x.length > 20 ||
        x.match(/[^\w]/gi)
      ) &&
      v.length <= (!premium ? 150 : 500)
    ),
    uncensor: checker('uncensor', (v) =>
      v &&
      v.constructor === Array &&
      !v.some(x =>
        x.length > 20 ||
        x.match(/[^\w]/gi)
      ) &&
      v.length <= (!premium ? 150 : 500)
    ),
    msg: {
      content: checker('msg.content', (v) =>
        typeof v === 'string'
          ? v.length <= 100
          : v === null || v === false
      ),
      deleteAfter: checker('msg.deleteAfter', (v) =>
        v === null
          ? true
          : (Number.isInteger(v) &&
          v > 0 &&
          v <= (!premium ? 120 * 1000 : 600 * 1000))
      )
    },
    punishment: {
      type: checker('punishment.type', (v) => !(v === 1 && !guild.r.some(x => obj.punishment.role === x.id)) && constants.punishmentTypes.includes(v)),
      amount: checker('punishment.amount', (v) => Number.isInteger(v) && v <= 50 && v > 0),
      role: checker('punishment.role', (v) => obj.punishment.type === 1 && guild.r.some(x => v === x.id))
    },
    webhook: {
      enabled: checker('webhook.enabled', (v) => typeof v === 'boolean', true),
      separate: checker('webhook.separate', (v) => typeof v === 'boolean', true),
      replace: checker('webhook.replace', (v) => constants.webhookReplaces.includes(v), true)
    },
    multi: checker('multi', (v) => typeof v === 'boolean', true),
    prefix: checker('prefix', (v) => v === null ? true : typeof v === 'string' && v.length <= 10),
    channels: checker('channels', (v) =>
      v &&
      v.constructor === Array &&
      !v.some(a => !guild.c.some(b => a === b.id)), true
    ),
    invites: checker('invites', (v) => typeof v === 'boolean')
  }
}

module.exports = { config, constants, verify }

/**
 * Webhook replace
 * @typedef {Number} WebhookReplace
 * @example
 * 0: ||Spoilers||
 * 1: h#shtags
 */
