const resolve = require('path').resolve.bind(undefined, __dirname)

module.exports = [
  { // cluster
    i: 0,
    client: resolve('../src/lib/client/CensorBot')
  },
  { // dashboard
    i: 1,
    client: resolve('../src/lib/dashboard/Manager')
  }
]

/**
 * @typedef {Number} jobInt Job identifier
 * @example
 *  0 = Bot cluster
 *  1 = Dashboard
 */

/**
 * @typedef {jobInt} Job Job
 * @property {Number} i Job number
 * @property {String} client Path to client file
 */
