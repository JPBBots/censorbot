const Express = require('express')
const { punishments: punishPort } = require('../ports')

const LoadRoutes = require('../util/LoadRoutes')

/**
 * Punishments express app
 */
class PunishmentApp {
  /**
   * Punishment App
   * @param {PunishmentManager} manager Managet
   */
  constructor (manager) {
    /**
     * Manager
     * @type {Manager}
     */
    this.manager = manager

    /**
     * Express App
     * @type {ExpressApp}
     */
    this.app = null
  }

  /**
   * Setup app
   * @returns {Promise.<undefined>} Resolved when app is listening
   */
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
