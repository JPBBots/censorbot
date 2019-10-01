const express = require("express");
var app = express();
const mappings = require('../../src/mappings.js');
let config = require(mappings.config);
const { readFileSync } = require("fs");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");

app.use(cookieParser());

app.set("views", __dirname);
app.set('view engine', 'ejs');

var pages = {
    index: "",
    server: ""
}

const base = "https://censorbot.jt3ch.net/dash/v3";

// function loadAll() {
//     pages.index = readFileSync(__dirname + "/index.html", "utf-8");
//     pages.server = readFileSync(__dirname + "/server.html", "utf-8");
// }

// loadAll();

/*
    global BigInt
    global RR
    global manager
*/

app.get("/test", (req, res) => {
    res.clearCookie("a");
    res.send("a");
})

function checkShard(guildID, shardamount) {
    guildID = String(guildID);
    var shard;
    for (var i = 0; i < shardamount; i++) {
        if ((BigInt(guildID) >> BigInt(22)) % BigInt(shardamount) == i) { shard = i; break; }
    }
    return shard;
}



app.get("/", async(req, res) => {
    let guilds = await global.getUser(req.cookies.token, res);
    if (!guilds) return;
    res.render("index", { guilds: guilds, token: req.cookies.token, base: base });
})

app.get("/.json", async(req, res) => {
    let guilds = await global.getUser(req.cookies.token, res);
    if (!guilds) return;
    res.json(guilds);
})

app.get("/login", (req, res) => {
    if (!req.query.token) return res.send("Error occured whilst setting token");
    res.cookie("token", req.query.token);
    res.redirect(base + "");
})

app.get("/reload", (req, res) => {
    if (req.query.a !== config.auth) return res.send("no");
    loadAll();
    res.send(":ok_hand:")
})


app.use("/:serverid", async(req, res, next) => {
    var guilds = await global.getUser(req.cookies.token, res);
    if (!guilds) return;
    
    let id = req.params.serverid.split(".")[0];
    var g = guilds.find(x => x.i == id);
    if (!g) return res.send("Unauthorized");
    req.shard = checkShard(String(id), config.shardCount);
    req.partialGuild = g;
    next();
})

app.get("/:serverid", async(req, res) => {
    var serverid = req.params.serverid;
    let type;
    if(serverid.includes(".")) {
        let split = serverid.split(".");
        serverid = split[0];
        type = split[1];
    }
    let stuff = await manager.shards.get(req.shard).eval(`
        function getStuff(client) {
            var guild = client.guilds.get("${serverid}");
            if(!guild) return false;
            return {
                c: guild.channels
                    .filter(x=>!x.deleted && x.type == "text")
                    .map(x=>{
                        return {
                            id: x.id, 
                            name: x.name
                        }
                    }),
                r: guild.roles
                    .filter(x=>!x.managed && x.name != "@everyone")
                    .map(x=>{
                        return {
                            id: x.id,
                            name: x.name
                        }
                    })
            }
        }
        getStuff(this);
    `)
    if(!stuff) return res.render("invite");
    let db = await global.db.rdb.getAll(serverid);
    if(!db) return res.send("Error occured while communicating with your server");
    delete db["_id"];
    var obj = {
        id: req.partialGuild.i,
        name: req.partialGuild.n,
        ...stuff,
        db: db
    };
    if(type == "json") return res.json(obj);
    res.render("server", { data: obj, base: base, token: req.cookies.token });
})

module.exports = app;
