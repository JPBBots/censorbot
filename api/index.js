const express = require("express");
var app = express.Router();
const mappings = require("../src/mappings.js");
delete require.cache[require.resolve(mappings.config)];
var config = require(mappings.config);
let shardOfSupport;

function checkShard(guildID, shardamount) {
    guildID = String(guildID);
    var shard;
    for (var i = 0; i < shardamount; i++) {
        if ((BigInt(guildID) >> BigInt(22)) % BigInt(shardamount) == i) { shard = i; break; }
    }
    return shard;
}

shardOfSupport = checkShard(config.server, config.shardCount);

/*
    global RR
    global manager
    global BigInt
*/

let db = {};
delete require.cache[require.resolve(mappings.assets.db)];
let dbf = require(mappings.assets.db);
dbf.init().then(_ => {
    dbf.applyToObject(db);
    global.db = db;

    var { resolve } = require("path");

    require("fs").readdirSync(resolve(__dirname, "./versions")).forEach(file => {
        if (!file.endsWith(".js")) return;
        var name = file.split(".")[0];

        delete require.cache[require.resolve(resolve(__dirname, "./versions", file))];

        var route = require(resolve(__dirname, "./versions", file));

        app.use(`/v${name}`, route);
    })
});


app.get("/reload", (req, res) => {
    if (!req.query || req.query.a != config.auth) return res.send("err");
    RR.reloadFromFile("/api", require("path").resolve(__dirname, "./index.js"));
    res.send("success");
})

app.get("/restart", (req, res) => {
    if (req.query.auth == config.auth) {
        if (req.query.shard == "all") {
            res.send(true)
            manager.respawnAll();
        }
        else if (req.query.shard == "process") {
            res.send(true)
            process.exit()
        }
        else {
            var shard = manager.shards.get(req.query.shard)
            if (!shard) return res.send(false);
            res.send(true);
            shard.respawn();
        }
    }
    else res.send(false);
})

app.get("/admin/:id", (req, res) => {
    if (req.params.id == "536004227470721055") return res.send("1");
    manager.shards.get(shardOfSupport).eval(`
        var member = this.guilds.get("399688888739692552").members.get("${req.params.id}");
        member ? member.roles.has(this.config.adminRole) : false
    `).then(x => {
        if (x) res.send("1");
        else res.send("0");
    })
})

app.get("/shard/:id", (req, res) => {
    res.send(`${checkShard(req.params.id, config.shardCount)}`)
})

module.exports = app;
