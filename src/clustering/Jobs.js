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
  { // punishments
    i: 2,
    client: resolve('../punishments/PunishmentManager')
  },
  { // stats
    i: 3,
    client: resolve('../stats/StatsManager')
  }
]

/**
 * @typedef {Number} jobInt Job identifier
 * @example
 *  0 = Bot cluster
 *  1 = api
 *  2 = punishments
 *  3 = stats
 */

/**
 * @typedef {Objectt} Job Job
 * @property {jobInt} i Job number
 * @property {String} client Path to client file
 */
