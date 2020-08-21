const noop = () => {} // eslint-disable-line no-empty-function
const methods = ['get', 'post', 'delete', 'patch', 'put']

function buildRoute () {
  const self = this
  const route = []
  const handler = {
    get (target, name) {
      if (methods.includes(name)) {
        return (options = {}) => self.run(name.toUpperCase(), route, options)
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
