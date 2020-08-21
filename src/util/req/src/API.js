const RouteBuilder = require('./RouteBuilder')
const Req = require('./Request')

function Request (url, headers, opts) {
  return RouteBuilder(Req.bind(undefined, url, headers, opts))
}

module.exports = Request
