const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./src/index.js', { token: require('./config.js').token });

const config = require("./config.js");

manager.spawn(config.shardCount);
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

const express = require("express");
var app = express();

app.get("/", (req, res) => {
    res.send("infomatic censorbot endpoint");
})

app.get("/info", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    var info = {
        shards: [],
        general: {
            remainingIndentifys: 0,
            totalIdentifys: 0,
            resetString: "loading"
        }
    };
    manager.shards.last().eval(`
        function getValues(client) {
            if((client.ws.sessionStartLimit.reset_after - client.uptime) < 0) client.ws.sessionStartLimit.reset_after = 86400000-client.ws.sessionStartLimit.reset_after;
            return {
                remainingIndentifys: client.ws.sessionStartLimit.remaining,
                totalIdentifys: client.ws.sessionStartLimit.total,
                reset_after: client.ws.sessionStartLimit.reset_after,
                clientUptimeforReset: client.uptime
            }
        }
        getValues(this);
    `).then(function(rp) {
        info.general.remainingIndentifys = rp.remainingIndentifys;
        info.general.totalIdentifys = rp.totalIdentifys;
        if(rp.reset_after < 0) rp.reset_after = (86400000+rp.reset_after);
        info.general.reset_after = rp.reset_after;
        info.general.clientUptime = rp.clientUptimeforReset;
        info.general.processUptime = process.uptime()*1000;
        manager.broadcastEval(`
                function getValues(client) {
                    return {
                        shard: client.shard.id, 
                        guilds: client.guilds.size,
                        unavailable: client.guilds.filter(x=>!x.available).size,
                        users: client.users.size, 
                        ping: client.ws.ping.toFixed(),
                        uptime: client.uptime
                    }
                }
                getValues(this)`)
            .then(resp => {
                var pings = resp.map(x => Number(x.ping));
                info.general.ping = (pings.reduce((a, b) => a + b, 0)) / pings.length;
                info.general.guildCount = resp.map(x => x.guilds).reduce((a, b) => a + b, 0)
                info.general.userCount = resp.map(x => x.users).reduce((a, b) => a + b, 0)
                resp.forEach(guild => {
                    info.shards.push(guild);
                })
                res.json(info);
            })
    });
})

const RR = require("express-router-reload");

let reloader = new RR(app);

app.use("/api", require("./api/index.js"));

global.RR = reloader;
global.manager = manager;

app.listen(1234, () => {
    console.log("Censorbot Informatic Started")
})

require("child_process").fork('./filter/api.js')

const ipc = require("node-ipc");

ipc.config.id = "censorbotmanager";
ipc.config.retry = 100;

ipc.serve(() => {
    ipc.server.on("restart", (message) => {
        var shard = manager.shards.get(Number(message.shard));
        if(!shard || message.shard == "all") return manager.shards.forEach(shard=>{
            shard.respawn();
        });
        shard.respawn();
    });
})

ipc.server.start();