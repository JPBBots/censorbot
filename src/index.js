console.log(process.argv.includes('-b') ? 'BETA' : 'PRODUCTION')

const Master = require('./lib/clustering/master/Master')

module.exports = new Master()
