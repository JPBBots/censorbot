const { resolve } = require('path')
const { Router } = require('express')
const { readdirSync, lstatSync, existsSync } = require('fs')

function createRouter () {
  const router = Router({ mergeParams: true })

  return router
}

module.exports = function (bind, app, dirName, dir, defaultLocation = '') {
  const loadFolder = (path, parent) => {
    let routes = readdirSync(resolve(dirName, path))
    if (routes.includes('index.js')) {
      routes = routes.filter(x => x !== 'index.js')
      routes.push('index.js')
    }
    routes.forEach(route => {
      if (route === 'middleware.js') return
      if (lstatSync(resolve(dirName, path, route)).isDirectory()) {
        const router = createRouter()

        if (existsSync(resolve(dirName, path, route, './middleware.js'))) {
          require(resolve(dirName, path, route, './middleware.js')).bind(bind)(router)
        }

        loadFolder(path + '/' + route, router)

        return parent.use(`/${route}`, router)
      }

      if (!route.endsWith('.js')) return

      delete require.cache[require.resolve(resolve(dirName, path, route))]

      const routeFile = require(resolve(dirName, path, route))
      if (!routeFile) return

      const routeName = route.replace(/index/gi, '').split('.')[0]

      const router = createRouter()

      routeFile.bind(bind)(router)

      parent.use(`/${routeName}`, router)
    })
  }
  const baseRouter = createRouter()

  loadFolder(resolve(dirName, dir), baseRouter)

  app.use(`/${defaultLocation}`, baseRouter)
}
