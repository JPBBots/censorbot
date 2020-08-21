const { resolve } = require('path')
const { Router } = require('express')
const { readdirSync, lstatSync } = require('fs')

module.exports = function (bind, app, dirName, dir) {
  const loadFolder = (path, current) => {
    let routes = readdirSync(resolve(dirName, path))
    if (routes.includes('index.js')) {
      routes = routes.filter(x => x !== 'index.js')
      routes.push('index.js')
    }
    routes.forEach(route => {
      if (lstatSync(resolve(dirName, path, route)).isDirectory()) return loadFolder(path + '/' + route, current + (route + '/'))

      if (!route.endsWith('.js')) return

      delete require.cache[require.resolve(resolve(dirName, path, route))]

      const routeFile = require(resolve(dirName, path, route))
      if (!routeFile) return

      const routeName = route.replace(/index/gi, '').split('.')[0]

      const router = Router()
      routeFile.bind(bind)(router)

      app.use(`/${current}${routeName}`, router)
    })
  }
  loadFolder(resolve(dirName, dir), '')
}
