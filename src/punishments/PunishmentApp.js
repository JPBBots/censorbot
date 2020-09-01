const Express = require('express')
const { punishments: punishPort } = require('../ports')

const LoadRoutes = require('../util/LoadRoutes')

class PunishmentApp {
  constructor (manager) {
    this.manager = manager

    this.app = null
  }

  setup () {
    return new Promise(resolve => {
      this.app = Express()

      LoadRoutes(this.manager, this.app, __dirname, './routes')

      this.app.listen(punishPort, () => {
        resolve()
      })
    })
  }
}

module.exports = PunishmentApp
