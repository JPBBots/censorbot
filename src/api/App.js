const Express = require('express')

const Path = require('path')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const LoadRoutes = require('../util/LoadRoutes')

const { api: apiPort } = require('../ports')

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

      this.app.listen(apiPort, () => {
        resolve()
        
      this.manager.log(`Started :${apiPort}`)
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

    this.app.use((req, res, next) => {
      if (!req.url.match(/static|updates\/./gi)) this.manager.log(`${req.method} ${req.url}`)

      req.api = req.originalUrl.split('?')[0].endsWith('.json') || req.method !== 'GET'

      next()
    })

    this.app.use('/static', Express.static(Path.resolve(__dirname, './static')))

    LoadRoutes(this.manager, this.app, __dirname, './routes')
  }
}

module.exports = App
