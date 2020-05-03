/**
 * Worker internal methods for brokering master internals
 */
class WorkerInternals {
  /**
   * Worker Internals
   * @param {Worker} worker Worker
   */
  constructor (worker) {
    /**
     * Worker
     * @type {Worker}
     */
    this.worker = worker
  }

  event (event, data) {
    let guild
    let shard
    switch (event) {
      case 'GUILD_FETCH':
        guild = this.worker.client.guilds.get(data.id)
        this.worker.send('GUILD_FETCHED', {
          id: data.id,
          guild: guild ? {
            i: guild.id,
            n: guild.name,
            a: guild.icon,
            c: this.worker.client.channels.filter(x => x.guild_id === data.id)
              .map(x => {
                return {
                  id: x.id,
                  name: x.name
                }
              }),
            r: guild.roles
              .map(x => {
                return {
                  id: x.id,
                  name: x.name
                }
              })
          } : null
        })
        break
      case 'RELOAD_INTERNALS':
        delete require.cache[require.resolve('./WorkerInternals')]
        const WorkerInternals = require('./WorkerInternals') // eslint-disable-line no-case-declarations
        this.worker.internal = new WorkerInternals(this.worker)
        break
      case 'RELOAD':
        this.worker.client.reloader.reload(data.name)
        break
      case 'GUILD_COUNT':
        this.worker.send('GUILD_COUNTED', { id: data.id, data: this.worker.client.internals.formatted })
        break
      case 'EVAL':
        const client = this.worker.client // eslint-disable-line
        this.worker.send('EVALED', { id: data.id, results: eval(data.ev) }) // eslint-disable-line no-eval
        break
      case 'SHARD_STAT':
        this.worker.send('SHARD_STATED', {
          id: data.id,
          data: this.worker.client.shards.map(shard => {
            return {
              id: shard.id,
              ping: shard.ping,
              connected: shard.connected,
              guilds: this.worker.client.guilds.filter(x => this.worker.client.guildShard(x.id) === shard.id).size
            }
          })
        })
        break
      case 'RESTART':
        shard = this.worker.client.shards.get(data.id)
        if (!shard) return
        if (data.destroy) return this.worker.client.killShard(data.id)
        shard.restart()
        break
      case 'PRESENCE':
        this.worker.client.setStatus(...data)
        break
      default:
        break
    }
  }

  fetchGuild (id) {
    return new Promise((resolve) => {
      const getFunction = (d) => {
        if (d.id !== id) return

        this.worker.off('GUILD_FETCHED', getFunction)

        resolve(d.guild)
      }

      this.worker.on('GUILD_FETCHED', getFunction)

      this.worker.send('GUILD_FETCH', { id })
    })
  }

  guildCount (counted) {
    return new Promise((resolve) => {
      const id = Number(new Date().getTime() + `${Math.random() * 10000}`).toFixed(0)
      const getFunction = (d) => {
        if (d.id !== id) return

        this.worker.off('GUILD_COUNTED', getFunction)

        resolve(counted ? d.guilds.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0) : d.guilds)
      }

      this.worker.on('GUILD_COUNTED', getFunction)

      this.worker.send('GUILD_COUNT', { id })
    })
  }

  shardStats () {
    return new Promise((resolve) => {
      const id = Number(new Date().getTime() + `${Math.random() * 10000}`).toFixed(0)
      const getFunction = (d) => {
        if (d.id !== id) return

        this.worker.off('SHARD_STATED', getFunction)

        resolve(d.shards)
      }

      this.worker.on('SHARD_STATED', getFunction)

      this.worker.send('SHARD_STAT', { id })
    })
  }

  eval (ev) {
    return new Promise((resolve) => {
      const id = Number(new Date().getTime() + `${Math.random() * 10000}`).toFixed(0)
      const getFunction = (d) => {
        if (d.id !== id) return

        this.worker.off('EVALED', getFunction)

        resolve(d.data)
      }

      this.worker.on('EVALED', getFunction)

      this.worker.send('EVAL', { id, ev })
    })
  }

  reload (name) {
    this.worker.send('RELOAD', { name })
  }

  restart (id, destroy) {
    this.worker.send('RESTART', { id, destroy })
  }

  killCluster (id) {
    this.worker.send('KILL', { id })
  }

  reloadInternals () {
    this.worker.send('RELOAD_INTERNALS')
  }
}

module.exports = WorkerInternals
