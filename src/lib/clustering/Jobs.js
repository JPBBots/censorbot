const resolve = require('path').resolve.bind(undefined, __dirname)

module.exports = [
  { // cluster
    i: 0,
    client: resolve('../client/CensorBot')
  },
  { // dashboard
    i: 1,
    client: resolve('../dashboard/Manager')
  }
]

/**
 * @typedef {Number} jobInt Job identifier
 * @example
 *  0 = Bot cluster
 *  1 = Dashboard
 */

/**
 * @typedef {Objectt} Job Job
 * @property {jobInt} i Job number
 * @property {String} client Path to client file
 */
