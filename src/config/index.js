delete require.cache[require.resolve('./prod/public.js')]
delete require.cache[require.resolve('./prod/private.js')]
delete require.cache[require.resolve('./beta/public.js')]
delete require.cache[require.resolve('./beta/private.js')]

const beta = process.argv.includes('-b')

module.exports = {
  ...require(`./${beta ? 'beta' : 'prod'}/public.js`),
  ...require(`./${beta ? 'beta' : 'prod'}/private.js`)
}
