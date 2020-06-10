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
