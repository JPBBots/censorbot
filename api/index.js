const express = require('express')
var app = express.Router()
const mappings = require('../src/mappings.js')
delete require.cache[require.resolve(mappings.config)]
var config = require(mappings.config)
let shardOfSupport

function checkShard (guildID, shardamount) {
  guildID = String(guildID)
  var shard
  for (var i = 0; i < shardamount; i++) {
    if ((BigInt(guildID) >> BigInt(22)) % BigInt(shardamount) == i) { shard = i; break }
  }
  return shard
}

shardOfSupport = checkShard(config.server, config.shardCount)

/*
    global RR
    global manager
    global BigInt
*/

const db = {}
delete require.cache[require.resolve(mappings.assets.db)]
const dbf = require(mappings.assets.db)
dbf.init().then(_ => {
  dbf.applyToObject(db)
  global.db = db

  var { resolve } = require('path')

  require('fs').readdirSync(resolve(__dirname, './versions')).forEach(file => {
    if (!file.endsWith('.js')) return
    var name = file.split('.')[0]

    delete require.cache[require.resolve(resolve(__dirname, './versions', file))]

    var route = require(resolve(__dirname, './versions', file))

    app.use(`/v${name}`, route)
  })
})

app.get('/reload', (req, res) => {
  if (!req.query || req.query.a != config.auth) return res.send('err')
  RR.reloadFromFile('/api', require('path').resolve(__dirname, './index.js'))
  res.send('success')
})

app.get('/restart', (req, res) => {
  if (req.query.auth == config.auth) {
    if (req.query.shard == 'all') {
      res.send(true)
      manager.respawnAll()
    } else if (req.query.shard == 'process') {
      res.send(true)
      process.exit()
    } else {
      var shard = manager.shards.get(req.query.shard)
      if (!shard) return res.send(false)
      res.send(true)
      shard.respawn()
    }
  } else res.send(false)
})

app.get('/admin/:id', (req, res) => {
  if (req.params.id == '536004227470721055') return res.send('1')
  manager.shards.get(shardOfSupport).eval(`
        var member = this.guilds.get("399688888739692552").members.get("${req.params.id}");
        member ? member.roles.has(this.config.adminRole) : false
    `).then(x => {
    if (x) res.send('1')
    else res.send('0')
  })
})

app.get('/shard/:id', (req, res) => {
  res.send(`${checkShard(req.params.id, config.shardCount)}`)
})

app.get('/cmds', async (req, res) => {
  res.json((await global.db.statdb.getAll()).filter(x => x.id.startsWith('cmd-')).map(x => {
    return {
      cmd: x.id.split('-')[1],
      amount: x.amount
    }
  }).sort((a, b) => { if (a.amount < b.amount) { return 1 } else if (a.amount > b.amount) { return -1 } else { return 0 } }))
})

const Reader = require("read-last-lines")

app.get("/err", async (req, res) => {
  res.send("<div>" + (await Reader.read(`C:/Users/Administrator/.pm2/logs/${req.query.p || 'censorbot'}-error.log`, 50)).split('\n').join('</div><div>') + "</div>")
})

app.get('/site/updates', (req, res) => {
  var url = 'https://censorbot.jt3ch.net/updates'
  res.redirect(url)
})

delete require.cache[require.resolve('/home/jpb/websites/censorbot/updates/updates.js')]

app.get('/site/updates/:v', (req, res) => {
  var url = 'https://censorbot.jt3ch.net/updates'
  var z = require('/home/jpb/websites/censorbot/updates/updates.js')
  var the = z.find((x) => x.v == req.params.v)
  res.send(`
  <!DOCTYPE html>
  <html>
    <head>
        <meta property="og:title" content="Update v${the.v}">
        <meta property="og:url" content="https://censorbot.jt3ch.net/updates/v/${req.params.v}">
        <meta property="og:description" content="${the.desc}">
    </head>
    <body>
        <h1>${req.params.v}</h1>
    </body>
    <script>
        window.location.replace("${url}#${req.params.v}");
    </script>
  </html>`)
})

app.get('/premium', (req, res) => {
  res.json({
    hello: 'world'
  })
})

async function isPremium (user) {
  var res = await manager.shards.get(shardOfSupport).eval(`
        function getValues(c) {
            var g = c.guilds.get("399688888739692552");
            if(!g) return null;
            var mem = g.members.get("${user}");
            if(!mem) return null;
            return mem.roles.keyArray();
        }
        getValues(this);
    `)
  if (!res) return false
  var amount = 0
  let isPrem = false
  res.forEach(x => {
    if (config.premiumRoles[x]) {
      amount += config.premiumRoles[x]
      isPrem = true
    }
  })
  const pudb = await global.db.pudb.getAll(user)
  return { p: isPrem, a: amount, g: pudb ? pudb.guilds : [] }
}

app.get('/premium/:userid', async (req, res) => {
  const user = await isPremium(req.params.userid)
  if (!user) return res.json({
    premium: false,
    amount: null,
    guilds: []
  })
  res.json({
    premium: user.p,
    amount: user.a,
    guilds: user.g
  })
})

module.exports = app
