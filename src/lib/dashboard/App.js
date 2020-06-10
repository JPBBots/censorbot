const Express = require('express')

const Path = require('path')
const fs = require('fs')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

/**
 * Express app manager
 */
class App {
  /**
   * Dashboard App
   * @param {Manager} manager Manager
   */
  constructor (manager) {
    /**
     * Manager
     * @type {Manager}
     */
    this.manager = manager

    /**
     * Express app
     * @type {?ExpressApp}
     */
    this.app = null
  }

  /**
   * Load app
   */
  load () {
    return new Promise(resolve => {
      this.app = Express()

      this._loadRoutes()

      this.app.listen(this.manager.config.port, () => {
        resolve()
      })
    })
  }

  /**
   * Load routes and middleware
   */
  _loadRoutes () {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))

    this.app.use(cookieParser())

    this.app.use(cors())

    this.app.set('views', Path.resolve(__dirname, './views'))
    this.app.set('view engine', 'ejs')

    this.app.use((req, res, next) => {
      if (!req.url.match(/static|updates\/./gi)) this.manager.log(`${req.method} ${req.url}`)

      req.api = req.originalUrl.split('?')[0].endsWith('.json') || req.method !== 'GET'

      next()
    })

    this.app.use('/static', Express.static(Path.resolve(__dirname, './static')))

    const loadFolder = (path, current) => {
      let routes = fs.readdirSync(Path.resolve(__dirname, path))
      if (routes.includes('index.js')) {
        routes = routes.filter(x => x !== 'index.js')
        routes.push('index.js')
      }
      routes.forEach(route => {
        if (fs.lstatSync(Path.resolve(__dirname, path, route)).isDirectory()) return loadFolder(path + '/' + route, current + (route + '/'))

        if (!route.endsWith('.js')) return

        delete require.cache[require.resolve(Path.resolve(__dirname, path, route))]

        const routeFile = require(Path.resolve(__dirname, path, route))
        if (!routeFile) return

        const routeName = route.replace(/index/gi, '').split('.')[0]

        const router = Express.Router()
        routeFile.bind(this.manager)(router)

        this.app.use(`/${current}${routeName}`, router)
      })
    }
    loadFolder('./routes', '')
  }
}

module.exports = App
