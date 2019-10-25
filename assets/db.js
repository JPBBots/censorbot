// const rethink = require("rethinkdbdash");
delete require.cache[require.resolve('./dbi.js')]
const dbi = require('./dbi.js')
const config = require('C:/Workspace/bots/censorbot/config.js').db
const MongoClient = require('mongodb').MongoClient

class jdb {
  constructor () {
    // this.db = rethink({
    //     port: 28015,
    //     host: "localhost",
    //     db: "server_data",
    //     silent: false,
    //     discovery: true
    // })
  }

  async init () {
    const db = new MongoClient(`mongodb://${config.username}:${config.password}@localhost:27017/`, { useNewUrlParser: true })
    await db.connect()
    this.db = db.db('censorbot')
  }

  get data () {
    return new dbi(this.db.collection('guild_data'), this.db)
  }

  get ticketer () {
    return new dbi(this.db.collection('ticketer'), this.db)
  }

  get punish () {
    return new dbi(this.db.collection('punishments'), this.db)
  }

  get config () {
    return BlankConfig
  }

  get ticket () {
    return new dbi(this.db.collection('tickets'), this.db)
  }

  get premium () {
    return new dbi(this.db.collection('premium'), this.db)
  }

  get voter () {
    return new dbi(this.db.collection('voters'), this.db)
  }

  get premiumuser () {
    return new dbi(this.db.collection('premium_users'), this.db)
  }

  get dash () {
    return new dbi(this.db.collection('dashboard_users'), this.db)
  }

  get stats () {
    return new dbi(this.db.collection('stats'), this.db)
  }

  get rawdb () {
    return this.db
  }

  applyToObject (obj) {
    obj.rdb = this.data
    obj.ticketerdb = this.ticketer
    obj.punishdb = this.punish
    obj.ticketdb = this.ticket
    obj.pdb = this.premium
    obj.vdb = this.voter
    obj.pudb = this.premiumuser
    obj.rawdb = this.rawdb
    obj.dashdb = this.dash
    obj.statdb = this.stats
  };
}

module.exports = new jdb()
