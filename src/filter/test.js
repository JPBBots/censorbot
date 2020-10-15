const Filter = require('./Filter')
const filter = new Filter()

const content = process.argv.slice(2).join(' ')

console.log('Resolved', filter.resolve(content))

console.log('Censored', filter.test(content))
