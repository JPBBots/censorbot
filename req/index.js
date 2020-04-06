module.exports = require('./src/API.js')

/**
 * Request library made out of Proxy's
 * @typedef {Proxy} Request
 * @example
 * const api = Request('https://api.jt3ch.net')
 *
 * api
 *  .this['is']
 *  .a('test')
 *  .hi
 *  .post({
 *    body: { hi: true },
 *    query: { test: 'a' }
 *  })
 *
 * // => POST https://api.jt3ch.net/this/is/a/test/hi?test=a BODY '{"hi": true }'
 */
