delete require.cache[require.resolve('./public.js')]
delete require.cache[require.resolve('./private.js')]

module.exports = {
  ...require('./public.js'),
  ...require('./private.js')
}
