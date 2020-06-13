const beta = process.argv.includes('-b')

delete require.cache[require.resolve(`./${beta ? 'beta' : 'prod'}/public.js`)]
delete require.cache[require.resolve(`./${beta ? 'beta' : 'prod'}/private.js`)]
delete require.cache[require.resolve('./shared.js')]

module.exports = {
  ...require(`./${beta ? 'beta' : 'prod'}/public.js`),
  ...require(`./${beta ? 'beta' : 'prod'}/private.js`),
  ...require('./shared.js')
}
