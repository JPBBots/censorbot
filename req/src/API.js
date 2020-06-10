const RouteBuilder = require('./RouteBuilder')
const Req = require('./Request')

function Request (url, headers, opts) {
  return RouteBuilder(Req.bind(null, url, headers, opts))
}

module.exports = Request
