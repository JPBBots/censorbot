const resolve = require('path').resolve.bind(undefined, __dirname)

module.exports = [
  { // cluster
    i: 0,
    client: resolve('../client/CensorBot')
  },
  { // dashboard
    i: 1,
    client: resolve('../api/Manager')
  },
  {
    i: 2,
    client: resolve('../punishments/PunishmentManager')
  }
]

/**
 * @typedef {Number} jobInt Job identifier
 * @example
 *  0 = Bot cluster
 *  1 = api
 */

/**
 * @typedef {Objectt} Job Job
 * @property {jobInt} i Job number
 * @property {String} client Path to client file
 */
