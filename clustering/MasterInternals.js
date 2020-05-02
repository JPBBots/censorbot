const guildShard = require('../util/GuildShard')

/**
 * Master internal functions
 */
class MasterInternals {
  /**
   * Master Internals
   * @param {Master} master Master
   */
  constructor (master) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master
  }

  /**
   * Run an event internally
   * @param {String} eventName Event
   * @param {?Object} data Data
   * @param {Cluster} cluster Cluster
   */
  event (eventName, data, cluster) {
    switch (eventName) {
      case 'GUILD_FETCH':
        this._guildFetch(data, cluster)
        break
      case 'GUILD_COUNT':
        this._guildCount(data.id, cluster)
        break
      case 'SHARD_STAT':
        this._shardStat(data.id, cluster)
        break
      case 'RESTART':
        this._restart(data)
        break
      case 'RELOAD_INTERNALS':
        this._reloadInternals()
        break
      case 'RELOAD':
        this._reload(data.name)
        break
      case 'PRESENCE':
        this._presence(data)
        break
      case 'KILL':
        this._kill(data.id)
        break
      default:
        break
    }
  }

  guildCluster (id) {
    return this.shardCluster(guildShard(id, this.master.shardCount))
  }

  shardCluster (id) {
    let guildCluster

    for (let i = 0; i < this.master.internalClusters.length; i++) {
      if (this.master.internalClusters[i].includes(id)) {
        guildCluster = this.master.clusters.get(i)
        break
      }
    }
    return guildCluster
  }

  _guildFetch (data, cluster) {
    const guildCluster = this.guildCluster(data.id)

    const getFunction = (d) => {
      if (d.id !== data.id) return
      guildCluster.off('GUILD_FETCHED', getFunction)

      cluster.send('GUILD_FETCHED', d)
    }

    guildCluster.on('GUILD_FETCHED', getFunction)

    guildCluster.send('GUILD_FETCH', data)
  }

  async _guildCount (id, cluster) {
    const promises = []
    this.master.clusters.forEach(cluster => {
      promises.push(new Promise(resolve => {
        const getFunction = (d) => {
          if (d.id !== id) return

          cluster.off('GUILD_COUNTED', getFunction)

          resolve(d.data)
        }

        cluster.on('GUILD_COUNTED', getFunction)

        cluster.send('GUILD_COUNT', { id })
      }))
    })

    const guilds = await Promise.all(promises)

    cluster.send('GUILD_COUNTED', { id, guilds })
  }

  async _shardStat (id, cluster) {
    const promises = []
    this.master.clusters.forEach(cluster => {
      promises.push(new Promise(resolve => {
        const getFunction = (d) => {
          if (d.id !== id) return

          cluster.off('SHARD_STATED', getFunction)

          resolve(d.data)
        }

        cluster.on('SHARD_STATED', getFunction)

        cluster.send('SHARD_STAT', { id })
      }))
    })

    const shards = await Promise.all(promises)

    cluster.send('SHARD_STATED', { id, shards })
  }

  _reload (name) {
    this.master.clusters.forEach(x => x.send('RELOAD', { name }))
  }

  _restart ({ id, destroy }) {
    const guildCluster = this.shardCluster(id)

    guildCluster.send('RESTART', { id, destroy })
  }

  _presence (data) {
    this.master.clusters.forEach(x => x.send('PRESENCE', data))
  }

  _reloadInternals () {
    this.master.clusters.forEach(x => x.send('RELOAD_INTERNALS'))

    delete require.cache[require.resolve('./MasterInternals')]

    const MasterInternals = require('./MasterInternals')

    this.master.internal = new MasterInternals(this.master)
  }

  _kill (id) {
    if (id === 'manager') return process.exit(1)

    const cluster = this.master.clusters.get(id)
    if (!cluster) return

    cluster.send('KILL')
  }
}

module.exports = MasterInternals
