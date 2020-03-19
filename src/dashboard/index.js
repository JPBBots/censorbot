const Express = require('express')
const app = Express()

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const fs = require('fs')
const { resolve } = require('path')

module.exports = (dash) => {
  dash.client.log(4, 0, 'MiddleWare')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(cookieParser())

  app.set('views', resolve(__dirname, './views'))
  app.set('view engine', 'ejs')
  app.use((req, res, next) => {
    if (!req.url.includes('static')) dash.client.log(4, 14, req.url, req.method)
    next()
  })

  dash.client.log(4, 1, 'MiddleWare')

  dash.client.log(4, 2, 'Routers')

  const loadFolder = (path, current) => {
    const routes = fs.readdirSync(resolve(__dirname, path))
    routes.forEach(route => {
      if (fs.lstatSync(resolve(__dirname, path, route)).isDirectory()) return loadFolder(path + '/' + route, current + (route + '/'))
      if (!route.endsWith('.js')) return
      delete require.cache[require.resolve(resolve(__dirname, path, route))]
      const routeFile = require(resolve(__dirname, path, route))
      if (!routeFile) return

      const routeName = route.replace(/index/gi, '').split('.')[0]
      const router = Express.Router()
      routeFile.bind(dash)(router)
      app.use(`/${current}${routeName}`, router)
      dash.client.log(4, 5, `/${current}${routeName}`)
    })
  }
  loadFolder('./routes', '')

  dash.client.log(4, 3, 'Routers')

  return app
}
