const Express = require('express')
const bodyParser = require('body-parser')

const guildShard = require('../util/GuildShard')

const fs = require('fs')
const { resolve } = require('path')

class MasterAPI {
  constructor (master, port) {
    this.master = master
    this.port = port

    this.app = null

    this.setup()
  }

  setup () {
    this.app = Express()

    this.loadRoutes()

    this.app.listen(this.port)
  }

  loadRoutes () {
    this.app._router = null

    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))

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
        routeFile.bind(this)(router)
        this.app.use(`/${current}${routeName}`, router)
      })
    }
    loadFolder('./routes', '')
  }

  guildCluster (id) {
    return this.shardCluster(guildShard(id, this.master.shardCount))
  }

  shardCluster (id) {
    let guildCluster

    for (let i = 0; i < this.master.internalClusters.length; i++) {
      if (this.master.internalClusters[i].includes(parseInt(id))) {
        guildCluster = this.master.clusters.get(i)
        break
      }
    }
    return guildCluster
  }

  sendTo (cluster, event, data, respond = false) {
    cluster = parseInt(cluster)
    cluster = this.master.clusters.get(cluster)
    if (!cluster) return
    if (!respond) {
      cluster.send(event, data)
    } else {
      return new Promise(resolve => {
        const id = Number(new Date().getTime() + `${Math.random() * 10000}`).toFixed(0)

        const getFunction = (d, i) => {
          if (i !== id) return

          cluster.off(event, getFunction)

          resolve(d)
        }

        cluster.on(event, getFunction)

        cluster.send(event, data, id)
      })
    }
  }

  async sendToAll (event, data, respond = false) {
    if (!respond) {
      this.master.clusters.forEach(cluster => {
        cluster.send(event, data)
      })
    } else {
      return Promise.all(
        this.master.clusters.map(x => this.sendTo(x.id, event, data, true))
      )
    }
  }
}

module.exports = MasterAPI
