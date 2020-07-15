const Express = require('express')
const bodyParser = require('body-parser')

const guildShard = require('../../../../util/GuildShard')

const LoadRoutes = require('../../../../util/LoadRoutes')

/**
 * API management and utility methods
 */
class MasterAPI {
  /**
   * Master API
   * @param {Master} master Master
   * @param {Number} port Port
   */
  constructor (master, port) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * API Port
     * @type {Number}
     */
    this.port = port

    /**
     * Express App
     * @type {?ExpressApp}
     */
    this.app = null

    this.setup()
  }

  /**
   * Setup http server
   */
  setup () {
    this.app = Express()

    this.loadRoutes()

    this.app.listen(this.port)
  }

  /**
   * (Re)load routes and middleware
   */
  loadRoutes () {
    this.app._router = null

    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))

    LoadRoutes(this, this.app, __dirname, './routes')
  }

  /**
   * Finds cluster that a guild belongs to
   * @param {Snowflake} id Guild ID
   * @returns {Cluster}
   */
  guildCluster (id) {
    return this.shardCluster(guildShard(id, this.master.shardCount))
  }

  /**
   * Finds a cluster that a shard belongs to
   * @param {Number} id Shard ID
   * @returns {Cluster}
   */
  shardCluster (id) {
    let guildCluster

    for (let i = 0; i < this.master.internalClusters.length; i++) {
      if (this.master.internalClusters[i].includes(parseInt(id))) {
        guildCluster = this.master.clusters.get(`${i}`)
        break
      }
    }
    return guildCluster
  }

  /**
   * Send data to all clusters
   * @param {String} event Event name
   * @param {?Object} data Data object
   * @param {Boolean} respond Whether to get the response of it
   * @param {Boolean} onlyClusters Whether to only send to bot clusters
   * @returns {void|Promise.<Array.<Object>>} Array of response data
   */
  sendToAll (event, data, respond = false, onlyClusters = true) {
    if (!respond) {
      this.master.clusters
        .filter(x => onlyClusters ? x.job === 0 : true)
        .forEach(cluster => {
          cluster.send(event, data)
        })
    } else {
      return Promise.all(
        this.master.clusters
          .filter(x => onlyClusters ? x.job === 0 : true)
          .map(cluster => cluster.send(event, data, true))
      )
    }
  }
}

module.exports = MasterAPI
