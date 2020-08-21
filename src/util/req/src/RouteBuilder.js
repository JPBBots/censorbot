const noop = () => {} // eslint-disable-line no-empty-function
const methods = ['get', 'post', 'delete', 'patch', 'put']
const reflectors = [
  'toString', 'valueOf', 'inspect', 'constructor',
  Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')
]

function buildRoute (req) {
  let route = ['']
  const handler = {
    get (target, name) {
      if (reflectors.includes(name)) return () => route.join('/')
      if (methods.includes(name)) {
        const routeBucket = []
        for (let i = 0; i < route.length; i++) {
          routeBucket.push(route[i])
        }
        return options => req(name, route.join('/'), Object.assign({
          route: routeBucket.join('/')
        }, options), () => { route = [''] })
      }
      route.push(name)
      return new Proxy(noop, handler)
    },
    apply (target, _, args) {
      route.push(...args.filter(x => x != null)) // eslint-disable-line eqeqeq
      return new Proxy(noop, handler)
    }
  }
  return new Proxy(noop, handler)
}

module.exports = buildRoute
