const express = require("express");
var app = express.Router();
const Discord = require('discord.js')
const flake = require("simpleflake");
const client = {}
client.config = require("../config.js");
require("../assets/db.js").applyToObject(client);


var fetch = require('node-fetch');
client.filterfile = require('../filter/filter.json')
delete require.cache[require.resolve("../filter/class.js")]
var filt = require("../filter/class.js");
client.filter = new filt(client, "./filter.json", "./linkbyp.json");

var perm = "ADMINISTRATOR";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    console.log(req.method + " " + req.url);
    next();
})

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/site/updates", (req, res) => {
    var url = "https://censorbot.jt3ch.net/updates"
    res.redirect(url);
})

delete require.cache[require.resolve("C:/Workspace/websites/censorbot/updates/updates.js")]

app.get("/site/updates/:v", (req, res) => {
    var url = "https://censorbot.jt3ch.net/updates"
    var z = require("C:/Workspace/websites/censorbot/updates/updates.js");
    var the = z.find((x) => x.v == req.params.v);
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

var errors = {
    //402's
    missingValue: {
        code: 400,
        message: "Missing Value",
        debug: "Missing body 'value' for POSTing new settings",
        when: 1
    },
    missingAuthorization: {
        code: 400,
        message: "Unauthorized",
        debug: "Missing 'Authorization' header",
        when: 2
    },
    missingServer: {
        code: 400,
        message: "Unauthorized",
        debug: "Missing ServerID in Authorization header",
        when: 3
    },
    missingToken: {
        code: 400,
        message: "Unauthorized",
        debug: "Missing Token in Authorization header",
        when: 4
    },

    //401's
    invalidUser: {
        code: 401,
        message: "Unauthorized",
        debug: "Invalid User/Token",
        when: 1
    },
    invalidGuild: {
        code: 401,
        message: "Invalid Server",
        debug: "Server doesn't exist or the bot is not in it.",
        when: 2
    },
    invalidMember: {
        code: 401,
        message: "Invalid Member",
        debug: "Server doesn't contain the requesting user",
        when: 3
    },
    badPermissions: {
        code: 401,
        message: "Wrong Permissions",
        debug: "User doesn't have the required '" + perm + "' permission",
        when: 4
    },

    //Database
    databaseError: {
        code: 500,
        message: "Database Error",
        debug: "Server was unable to process/complete database request",
        when: 1
    },

    //Log
    noChannels: {
        code: 400,
        message: "No Channels",
        debug: "No channels or all channels inaccessible",
        when: 5
    },
    logInvalidChannel: {
        code: 422,
        message: "Invalid Channel",
        debug: "The channel doesn't exist or isn't on the given server",
        when: 1
    },

    //Role
    noRoles: {
        code: 400,
        message: "No Roles",
        debug: "No roles or all roles inaccessible",
        when: 6
    },
    roleInvalidRoles: {
        code: 422,
        message: "Invalid Role",
        debug: "The role doesn't exist or isn't on the given server",
        when: 2
    },

    //Censor
    invalidBoolean: {
        code: 422,
        message: "Invalid Boolean",
        debug: "Only accepts '0' or '1'",
        when: 7
    },

    //Filter
    invalidWord: {
        code: 422,
        message: "Unnaceptable Characters",
        debug: "Unacceptable Characters are contained in the provided string",
        when: 8
    },
    alreadyCensored: {
        code: 422,
        message: "Already Censored",
        debug: "This word is already censored by the base filter",
        when: 9
    },
    alreadyInFilter: {
        code: 422,
        message: "Word is already in filter",
        debug: "The word requested to be added is already in the filter",
        when: 10
    },

    //Pop message
    notANumber: {
        code: 422,
        message: "Invalid Number",
        debug: "The number you attempted to set is not a number",
        when: 11
    },
    missingMsgOrTime: {
        code: 422,
        message: "Missing Message or Time",
        debug: "While attempting to set, missing msg or time in value",
        when: 12
    }
}

/*
global manager
global RR
*/

async function getStuff(script, cb) {
    var res;
    for (var i = 0; i < manager.shards.size; i++) {
        var temp = await manager.shards.get(i).eval(script)
        if (temp) {
            res = temp;
            break;
        }
    }
    cb(res, i);
}

let getuser = async (tok) => {
    let e = await require('node-fetch')("https://discordapp.com/api/users/@me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tok}`,
        }
    })
    return e;
}

function getUsersGuilds(userID, cb) {
    manager.broadcastEval(`
        var usersGuilds = this.guilds.filter(x=>x && x.owner && x.owner.user.id == "${userID}")
        if(usersGuilds) usersGuilds.map(x=>{return {id: x.id, name: x.name, shard: x.shard.id}});
    `).then(result => {
        result = [].concat.apply([], result);
        cb(result);
    })
}

function CHECK(res, callback, ifpost) {
    var response = {};
    var req = res.req;
    console.log(req.body);
    if (ifpost && (!req.body || !req.body.value)) return res.json({
        error: errors["missingValue"]
    });
    if (!req.headers || !req.headers.authorization) return res.json({
        error: errors["missingAuthorization"]
    });
    var [server, token] = req.headers.authorization.split(" ");
    if (!server) return res.json({
        error: errors["missingServer"]
    });
    if (!token) return res.json({
        error: errors["missingToken"]
    });
    console.log(`User ${token} is attempting to authorize ${server}`);
    getuser(token)
        .then(x => x.json())
        .then(User => {
            if (!User || !User.id) return res.json({
                error: errors["invalidUser"]
            });
            response.User = User;
            getStuff(`this.guilds.get("${server}")`, (Guild, Shard) => {
                if (!Guild || !Guild.id) return res.json({
                    error: errors["invalidGuild"]
                });
                const shard = manager.shards.get(Shard);
                // response.shard = shard
                response.guild = Guild;
                response.channel = async function () {
                    return await shard.eval(
                        `this.guilds.get("${Guild.id}").channels.array()
                            .filter(x=>!x.deleted && x.type == "text")
                            .map(x=>{
                                return {
                                    id: x.id, 
                                    name: x.name
                                }
                            })`
                    );
                }
                response.roles = async function () {
                    return await shard.eval(
                        `this.guilds.get("${Guild.id}").roles.array()
                            .filter(x=>!x.managed && x.name != "@everyone")
                            .map(x=>{
                                return {
                                    id: x.id,
                                    name: x.name
                                }
                            })
                        `
                    );
                }
                shard.eval(`var member = this.guilds.get("${Guild.id}").members.get("${User.id}"); member && member.permissions.has("${perm}")`)
                    .then(Perm => {
                        if (!Perm && User.id !== "142408079177285632") return res.json({
                            error: errors["badPermissions"]
                        });
                        callback(response)
                    })
            })
        })
}

app.get("/", (req, res) => {
    res.json({
        hello: "world"
    })
})

app.get("/info", (req, res) => {
    manager.broadcastEval("this.guilds.size").then(x => {
        res.json(x);
    })
})

app.get("/test", (req, res) => {
    getStuff(`this.guilds.get("399688888739692552").channels.array()
        .filter(x=>!x.deleted && !x.managed && x.type != 0)
        .map(x=>{
            return {
                id: x.id, 
                name: x.name
            }
        })`, (result, shard) => {
        res.json(result);
    })
})

app.get('/inserver', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    getStuff(`this.guilds.get("${req.query.serverid}")`, (result, i) => {
        if(!result) return res.send("0");
        else res.send("1");
    })
});
app.post("/inserver", async (req, res) => {
    if (!req.headers.authorization) return res.send("0");
    var [server, token] = req.headers.authorization.split(" ");
    if (!server) return res.send("0");
    getStuff(`this.guilds.get("${server}")`, (result, i) => {
        if(!result) return res.send("0");
        else res.send("1");
    })
})

function dbHandler(res, cb) {
    return function (response) {
        if (!response || (!response.replaced && !response.inserted && !response.deleted)) return res.json({
            error: errors["databaseError"]
        });
        cb();
    }
}

app.get("/auth", (req, res) => {
    CHECK(res, (response) => {
        res.json(response);
    })
})

//log

app.get("/log", (req, res) => {
    CHECK(res, async (response) => {
        var Channels = await response.channel();
        if (!Channels[0].id) return res.json({
            error: errors["noChannels"]
        });
        var channel = (await client.rdb.get(response.guild.id).run()).log
        if (!channel || channel == "none") return res.json({
            name: "none",
            id: "0"
        });
        console.log(channel)
        let curChan = Channels[Channels.map(x => x.id).indexOf(channel)];
        console.log(curChan)
        if (!curChan) return res.json({
            name: "error",
            id: "1"
        });
        return res.json({
            name: "#" + curChan.name,
            id: curChan.id
        });
    })
})
app.post("/log", (req, res) => {
    CHECK(res, (response) => {
        response.channel().then(Channels => {
            var channel = Channels.filter(x => x.id == req.body.value)[0];
            if (!channel) return res.json({
                error: errors["logInvalidChannel"]
            });
            client.rdb.get(response.guild.id).update({
                id: response.guild.id,
                log: req.body.value
            }).run().then(dbHandler(res, () => {
                res.json({
                    newValue: {
                        name: `#${channel.name}`,
                        id: channel.id
                    }
                });
            }))
        })
    }, true)
})
app.get("/channels", (req, res) => {
    CHECK(res, (response) => {
        response.channel().then(Channels => {
            res.json(Channels);
        })
    })
})

//uncensor role
app.get("/role", (req, res) => {
    CHECK(res, async (response) => {
        var roles = await response.roles();
        var role = (await client.rdb.get(response.guild.id).run()).role
        if (!role) return res.json({
            name: "none",
            id: "0"
        });
        console.log(role)
        let curRole = roles[roles.map(x => x.id).indexOf(role)];
        console.log(curRole)
        if (!curRole) return res.json({
            name: "error",
            id: "1"
        });
        return res.json({
            name: "@" + curRole.name,
            id: curRole.id
        });
    })
})
app.post("/role", (req, res) => {
    CHECK(res, async (response) => {
        var roles = await response.roles()
        let Role = roles[roles.map(x => x.id).indexOf(req.body.value)];
        if (!Role) return res.json({
            error: errors["roleInvalidRoles"]
        });
        if (Role.managed) return res.json({
            error: errors["roleInvalidRoles"]
        })
        client.rdb.get(response.guild.id).update({
            role: req.body.value
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: {
                    name: `@${Role.name}`,
                    id: Role.id
                }
            });
        }))
    }, true)
})
app.delete("/role", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            role: null
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: {
                    name: `none`,
                    id: "0"
                }
            })
        }))
    })
})
app.get("/roles", (req, res) => {
    CHECK(res, async (response) => {
        var roles = await response.roles();
        res.json(roles)
    })
})

//Censor
app.get("/censor", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).run().then(respo => {
            res.json({
                censor: respo && respo.censor ? true : false
            });
        })
    })
})
app.post("/censor", (req, res) => {
    CHECK(res, (response) => {
        if (!["0", "1"].includes(req.body.value)) return res.json({
            error: errors["invalidBoolean"]
        })
        client.rdb.get(response.guild.id).update({
            censor: req.body.value == "0" ? false : true
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: req.body.value == "0" ? false : true
            })
        }))
    })
})

//Filter
app.get("/filter", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).then(respo => {
            res.send(respo.filter);
        })
    })
})
app.put("/filter", (req, res) => { //adding
    CHECK(res, (response) => {
        if (req.body.value.match(/[^a-zA-Z0-9 ]/gi)) return res.json({
            error: errors["invalidWord"]
        });
        var filter = client.filter.test(req.body.value, true);
        if (filter.censor) return res.json({
            error: errors["alreadyCensored"]
        });
        client.rdb.get(response.guild.id)("filter").run().then(Filter => {
            if (Filter.includes(req.body.value.toLowerCase())) return res.json({
                error: errors["alreadyInFilter"]
            });
            Filter.push(req.body.value.toLowerCase());
            client.rdb.get(response.guild.id).update({
                filter: Filter
            }).run().then(dbHandler(res, () => {
                res.json({
                    newValue: Filter
                });
            }))
        })
    }, true)
})
app.patch("/filter", (req, res) => { //removing
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id)("filter").run().then(Filter => {
            Filter = Filter.filter(x => x != req.body.value.toLowerCase());
            client.rdb.get(response.guild.id).update({
                filter: Filter
            }).run().then(dbHandler(res, () => {
                res.json({
                    newValue: Filter
                });
            }))
        })
    }, true)
})
app.delete("/filter", (req, res) => { //clearing
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            filter: []
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: []
            });
        }))
    })
})

// Anti-Ghost Ping

app.get("/agp", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).run().then(respo => {
            res.json({
                agp: respo && respo.antighostping ? true : false
            });
        })
    })
})

app.post("/agp", (req, res) => {
    CHECK(res, (response) => {
        if (!["0", "1"].includes(req.body.value)) return res.json({
            error: errors["invalidBoolean"]
        })
        client.rdb.get(response.guild.id).update({
            antighostping: req.body.value == "0" ? false : true
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: req.body.value == "0" ? false : true
            })
        }))
    }, true)
})

// Pop Message
app.get("/popmessage", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).run()
            .then(result => {
                res.json({
                    msg: result.msg,
                    time: result.pop_delete
                })
            })
    })
})

app.get("/popmessage/msg", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).run()
            .then(result => {
                res.json({
                    msg: result.msg
                })
            })
    })
})

app.get("/popmessage/time", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).run()
            .then(result => {
                res.json({
                    time: result.time
                })
            })
    })
})

app.post("/popmessage/msg", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            msg: String(req.body.value)
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: String(req.body.value)
            })
        }))
    }, true)
})

app.delete("/popmessage/msg", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            msg: false
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: false
            })
        }))
    })
})

app.patch("/popmessage/msg", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            msg: null
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: null
            })
        }))
    })
})

app.post("/popmessage/time", (req, res) => {
    CHECK(res, (response) => {
        if (isNaN(req.body.value)) return res.json({
            error: errors["notANumber"]
        });
        client.rdb.get(response.guild.id).update({
            pop_delete: Number(req.body.value)
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: Number(req.body.value)
            })
        }))
    }, true)
})

app.post("/popmessage", (req, res) => {
    CHECK(res, (response) => {
        var msg = req.body.value.msg;
        var time = req.body.value.time;
        if ((!msg && (msg !== false && msg !== null)) || (!time && (time !== null))) return res.json({
            error: errors["missingMsgOrTime"]
        });
        if (time !== null && isNaN(time)) return res.json({
            error: errors["notANumber"]
        });
        client.rdb.get(response.guild.id).update({
            msg: !msg || msg === true ? msg : String(msg),
            pop_delete: time === null ? null : Number(time)
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: {
                    msg: msg === false ? false : String(msg),
                    time: time === null ? null : Number(time)
                }
            });
        }));
    }, true)
})

app.delete("/popmessage", (req, res) => {
    CHECK(res, (response) => {
        client.rdb.get(response.guild.id).update({
            msg: null,
            pop_delete: 3000
        }).run().then(dbHandler(res, () => {
            res.json({
                newValue: {
                    msg: null,
                    time: 3000
                }
            })
        }))
    })
})


app.post("/test", (req, res) => {
    if (!req.body || !req.body.test) return res.json({
        error: "expected body: test"
    });
    res.json(client.filter.test(req.body.test, true));
})

//admin endpoints

app.get("/admin/userGuilds/:id", (req, res) => {
    if (!req.headers.authorization || !req.headers.authorization.split(" ")[1]) return res.json({
        error: {
            message: "unatuh"
        }
    });
    getuser(req.headers.authorization.split(" ")[1])
        .then(x => x.json())
        .then(re => {
            if (re.id !== "142408079177285632") return res.json({
                error: {
                    message: "unatuh"
                }
            });

            getUsersGuilds(req.params.id, (result) => {
                res.json(result);
            })
        })
})

app.get("/admin/guild/:id", (req, res) => {
    if (!req.headers.authorization || !req.headers.authorization.split(" ")[1]) return res.json({
        error: {
            message: "unatuh"
        }
    });
    getuser(req.headers.authorization.split(" ")[1])
        .then(x => x.json())
        .then(res => {
            if (res.id !== "142408079177285632") return res.json({
                error: {
                    message: "unatuh"
                }
            });

            getStuff(`this.guilds.get("${req.params.id}")`, async (Guild, Shard) => {
                let data = await client.rdb.get(Guild.id).run();
                res.json({
                    info: {
                        name: Guild.name,
                        id: Guild.id,
                        memberCount: Guild.memberCount,
                        icon: Guild.iconURL
                    },
                    db: data
                })
            })
        })
})

module.exports = app;