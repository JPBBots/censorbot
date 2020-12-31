const { BufferedMetricsLogger } = require('datadog-metrics')
const Express = require('express')

const { datadog } = require('../settings')
const { stats: statsPort } = require('../ports')

const Logger = require('../util/Logger')
const LoadRoutes = require('../util/LoadRoutes')

const Database = require('../services/Database')

const config = require('../config')

/**
 * Manager for stats API & DataDog requests
 */
class StatsManager extends BufferedMetricsLogger {
  /**
   * Stats Manager
   * @param {Worker} cluster Cluster worker
   */
  constructor (cluster) {
    super({
      apiKey: datadog.key,
      host: 'jpb',
      prefix: 'censorbot.',
      flushIntervalSeconds: 15
    })
    /**
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger('STATS')

    /**
     * Cluster worker
     * @type {Worker}
     */
    this.cluster = cluster

    /**
     * Express app
     * @type {ExpressApp}
     */
    this.app = null

    /**
     * Database
     * @type {Database}
     */
    this.db = null

    this.runs = [
      async () => { // 30 seconds
        this.gauge('performance.ram', (process.memoryUsage().rss / 1024 / 1024).toFixed(0), [], Date.now())
      },
      async () => { // 2 minut
        // events per minute and ping
        const clusters = await this.cluster.internal.shardStats()
        this.gauge('client.epm', clusters.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.events, 0), 0), [], Date.now())
        this.gauge('client.ping', clusters.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.ping, 0), 0) / clusters.reduce((a, b) => a + b.shards.length, 0), [], Date.now())
      },
      async () => { // 5 minutes
        await this._updateCurrents()

        // regions
        const regions = await this.cluster.internal.getRegions()
        Object.keys(regions).forEach(region => {
          this.gauge('guilds.region', regions[region], [`region:${region}`], Date.now())
        })
      }
    ]

    if (datadog.key !== 'none') {
      this.clocks = [
        setInterval(() => { // 30 seconds
          this.runs[0]()
        }, 30000),
        setInterval(() => { // 2 minutes
          this.runs[1]()
        }, 120000),
        setInterval(() => { // 5 minutes
          this.runs[2]()
        }, 300000)
      ]
    }

    /**
     * Current Object
     * @type {Object}
     */
    this.currents = {
      GUILD_COUNT: null,
      TICKET_WAITING_COUNT: null,
      TICKET_ACCEPTED_COUNT: null,
      CURSE_COUNT: null
    }
  }

  /**
   * Log
   * @param  {...any} _ Log Data
   */
  log (..._) {
    this.logger.log(..._)
  }

  /**
   * Start
   */
  async start () {
    await this._createApp()

    if (datadog.key === 'none') return
    this.db = new Database(this, config.db.username, config.db.password)
    await this.db.connect()

    await this._updateCurrents()

    await Promise.all(this.runs.map(x => x()))

    this.log('Started :' + statsPort)
  }

  /**
   * Create HTTP API and bind to StatsEvents
   */
  _createApp () {
    return new Promise(resolve => {
      this.app = Express()

      if (datadog.key === 'none') this.app.use((req, res) => res.json({ success: true }))
      else LoadRoutes(this, this.app, __dirname, './routes')

      this.app.listen(statsPort, () => {
        resolve()
      })
    })
  }

  /**
   * Update current numbers
   */
  async _updateCurrents () {
    this.currents.GUILD_COUNT = await this.cluster.internal.guildCount(true)

    const tickets = await this.db.collection('tickets').find({}).toArray()
    this.currents.TICKET_WAITING_COUNT = tickets.filter(x => !x.accepted).length
    this.currents.TICKET_ACCEPTED_COUNT = tickets.filter(x => x.accepted).length

    this.currents.CURSE_COUNT = await this.db.collection('stats').findOne({ id: 'deleted' }).then(x => x.amount)

    this.gauge('guilds.count', this.currents.GUILD_COUNT)

    this.gauge('tickets.waiting', this.currents.TICKET_WAITING_COUNT)
    this.gauge('tickets.approved', this.currents.TICKET_ACCEPTED_COUNT)
    this.gauge('tickets.total', this.currents.TICKET_ACCEPTED_COUNT + this.currents.TICKET_WAITING_COUNT)

    this.gauge('filter.count', this.currents.CURSE_COUNT)
  }
}

module.exports = StatsManager
