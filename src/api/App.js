const Express = require('express')

const Path = require('path')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const LoadRoutes = require('../util/LoadRoutes')

const { api: apiPort } = require('../ports')

const Embed = require('../discord/Embed')

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
      this.manager.cluster.internal.sendWebhook('api', new Embed()
        .title(`${req.method} ${req.url}`)
        .description(`${req.body ? `${Object.keys(req.body).length} keys` : 'No body'}`)
        .field('Session Info', `Cloudflare: ${req.cookies.__cfduid}`, true)
        .field('GA', req.cookies._ga, true)
        .timestamp()
      )

      req.api = req.originalUrl.split('?')[0].endsWith('.json') || req.method !== 'GET'

      next()
    })

    this.app.use('/static', Express.static(Path.resolve(__dirname, './static')))

    LoadRoutes(this.manager, this.app, __dirname, './routes')
  }
}

module.exports = App
