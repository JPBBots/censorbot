module.exports = (client) => {
    const fs = require('fs')
    let Discord = require('discord.js')
    var fetch = require('node-fetch')
    const JPBUtils = require('./utils');
    client.u = new JPBUtils(client);
    //Remove accents function
    if(client.shard) {
        client.shard.id = client.options.shards[0];
        client.shard.count = client.options.shardCount;
    }
    client.RemoveAccents = (str) => {
          var accents = "$ÀÁÂÃÄÅĄĀāàáâãäåąßβÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏĪìíîïīÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚŞšśşŤťŸÝÿýŽŻŹžżźđĢĞģğµ§ṈṉΑΒΝΗΕΙΤƎ△ıскР¡"
          var accentsOut = "sAAAAAAAAaaaaaaaabbOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIIiiiiiUUUUUuuuuuLLLlllNNNnnnRrSSSsssTtYYyyZZZzzzdGGggusNnABNHEITeaickpi";
          str = str.split('');
          var strLen = str.length;
          var i, x;
          for (i = 0; i < strLen; i++) {
              if ((x = accents.indexOf(str[i])) != -1) {
                  str[i] = accentsOut[x];
              }
          }
          return str.join('');
        };
    //Test if array contains string function
    client.reloadFunctions = function() {
        delete require.cache[require.resolve("./functions.js")];
        require('./functions.js')(this);
    }
    client.reloadKDB = function() {
        delete require.cache[require.resolve("./database.js")];
        require('./database.js')(this);
    }
    client.arrHas = (str, arr) => {
        return (arr.indexOf(str) > -1)
    }
    //Test if message should be censored (for censor i/o and uncensor role)
    client.q_censored = async (mem) => {
        let guild = mem.guild
        let c = [true,false]
        let k = await client.db.find(guild.id,'censor')
        if(k == false) c = [false, true]
        let r = await client.db.find(guild.id,'role')
        if(!r) {
            client.db.create(mem.guild.id, new client.config.serverConfig(mem.guild.id));
            return true;
        }
        for(i=0;i<r.length;i++) {
            if(guild.roles.has(r[i])) {
                if(mem.roles.has(r[i])) {
                    c = [false, false]
                    break;
                }
            }
        }
        return c;
    }
    //Get guilds log channel
    client.q_log = async (g) => {
        let glog = await client.db.find(g.id,'log')
        if(glog === "none") return false;
        if(!client.channels.get(glog)) {
            client.db.set(g.id,'log','none')
            return false;
        }
        return glog;
    }
    //array func
    // Array.prototype.contains = function(element){
    //     return this.indexOf(element) > -1;
    // };
    Array.prototype.makeReadable = function(){
        let ok = ""
        for(i=0; i<this.length; i++) {
            let or = ""
            let a = ""
            if(!this[i+1]) {
                or = ''
                if(this.length > 1) {
                    a = 'and '
                } else {
                    a = ''
                }
            } else {
                if(this[i+2]) {
                    or = ', '
                } else {
                    if(!this[i+1]) {
                        or = ''
                    } else {
                        or = ' '
                    }
                }
                a = ''
            }
            ok += a + this[i] + or
        }
        return ok
    }

    Boolean.prototype.swap = function() { return this == true ? false : true}

    client.flip = function(json) {
        var res = {};
        for(var key in json) {
            if(key == "flip") continue;
            res[json[key]] = key;
        }
        return res;
    }
    //Reload config
    client.reloadConfig = () => {
        delete require.cache[require.resolve(`../config.js`)];
        client.config = require('../config.js')(client);
        return;
    }
    //Reload filter
    client.reloadFilter = () => {
        client.filter.reload();
    }
    client.reloadClass = () => {
        delete require.cache[require.resolve("../filter/class.js")];
        var filter = require("../filter/class")
        delete client.filter;
        client.filter = new filter(client, "./filter.json", "./linkbyp.json")
    }
    client.reloadUtils = () => {
        delete require.cache[require.resolve("./utils.js")];
        delete client.u;
        var utils = require("./utils.js");
        client.u = new utils(client);
    }
    client.unloadFilter = async () => {
        try {
        delete require.cache[require.resolve('../filter/filter.json')]
        delete client.filterfile
        } catch(error) {
            return error.message
        }
        return true;
    }
    client.loadFilter = async () => {
        try {
        client.filterfile = require('../filter/filter.json')
        } catch(error) {
            return error.message
        }
        return true;
    }
    //If admin
    client.isAdmin = (userid) => {
        return client.config.admins.includes(userid)
    }
    //^ for msg
    client.MisAdmin = (msg) => {
        return client.config.admins.includes(msg.author.id)
    }
    //MessageEmbed Error
    client.sendErr = async (msg, errormessage) => {
        let o = client.u.embed
        .setColor("DARK_RED")
        .setTitle(errormessage)
        .setFooter("Command Ran by " + msg.author.username)
        let me = await msg.channel.send(o)
        setTimeout(() => {
            me.delete()
        }, 4000);
        return true
    }
    client.d = (time) => {
        return function(message) {
            setTimeout(() => {
                message.delete()
            }, time);
        };
    }
    client.sendSettings = async (msg, data, reply, ifGrave, ifE) => {
        /**
         *   Data: [Setting Name, Was, Changed Too];
         *   Reply: [Desc, FOOT]
         */
        ifE = ifE || false;
        ifGrave = ifGrave ? ifGrave : [true, true]
        var grave1 = "\`";
        if(ifGrave[0] == false) grave1 = ""
        var grave2 = "\`";
        if(ifGrave[1] == false) grave2 = ""
        console.log(grave1, grave2)
        var LOG = await client.q_log(msg.guild);
        if(!LOG) return client.sendErr(msg, "You need to set a log channel before changing settings! (" + client.config.prefix + "setlog)")
        let newEmbed = client.u.embed
            .setTitle(`Setting Was Changed!`)
            .setTimestamp(new Date())
            .setThumbnail("https://cdn1.iconfinder.com/data/icons/flat-web-browser/100/settings-512.png")
            .setDescription(`In ${msg.channel} by ${msg.author} (${msg.author.tag})`)
            .addField("Setting Changed", data[0], true)
            .addField("Old Value => New Value", `${grave1}${data[1]}${grave1} => ${grave2}${data[2]}${grave2}`, true)
            .setColor("#7089b2");
        client.channels.get(LOG).send(newEmbed);
        //
        client.sendSuccess(msg, reply[0], reply[1])
        if(ifE) return newEmbed;
        return 200
    }
    //MessageEmbed Success
    client.sendSuccess = async (msg, successmessage, foot) => {
        let o = new Discord.MessageEmbed()
        .setColor("DARK_GREEN")
        .setTitle(successmessage)
        .setFooter(foot)
        let me = await msg.channel.send(o)
        setTimeout(() => {
            me.delete()
        }, 6000);
    }
    
    client.uriReq = async (method, uri, body) => {
        var fet = await fetch(`https://discordapp.com/api/${uri}`, {
            method: method.toUpperCase(),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${client.config.token}`
            },
            body: JSON.stringify(body)
        })
        return fet;
    }
    //Start new window
    client.exec = (a) => {
        const util = require('util');
        const exec = util.promisify(require('child_process').exec);

        async function ls() {
            const { stdout, stderr } = await exec(a);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
        }
        ls();
    }
    //Log commands
    client.logc = (msg, cmd) => {
        console.log(`Shard ${client.shard.id} | ${msg.author.tag} ran command: `.cyan + `${cmd}`.cyan.underline)
    }
    //filter test
    client.test = (s, g) => {
        let a = client.RemoveAccents(s).slice().trim().split(/ +/g)
        let u = require('./filter/filter.js')(client, a, g, true)
        return u;
    }
    //json db control
    function fl(s) {return './data/server_data/' + s + '.json'}
    let db = client.rdb
    async function read(f) {
        let v = await db.get(f).run()
        if(!v) return false
        else return v
    }
    function create(f,v) {
        v.id = f
        db.insert(v).run()
        .catch(err=>{
            if(err) {
                console.log(err)
                return err
            }
        })
        return true;
    }
    function rewrite(f,p,v) {
        var k = {};
        k[p] = v;
        db.get(f).update(k).run();
        return true
    }

    async function arewrite(f,p,v) {
        var k = {};
        k[p] =v;
        return await db.get(f).update(k).run();
    }
    // function clear(f,v) {
    //     if(fs.existsSync(fl(f))) {
    //         fs.writeFileSync(fl(f),JSON.stringify(v))
    //         return true
    //     } else {
    //         return false
    //     }
    // }
    function del(f) {
        if(fs.existsSync(fl(f))) {
            fs.unlinkSync(fl(f))
            return true
        } else {
            return false
        }
    }
    client.db = {
        set: (f,p,v) => {
            /**
             * Code Key:
             * 0: Error
             * 1: Success
             */
            let u = rewrite(f,p,v)
            if(u) {
                return 1
            } else {
                return 0
            }
        },
        aset: async (f,p,v) => {
            return await arewrite(f,p,v);
        },
        find: async (f,v) => {
            let res = await read(f)
            return res[v]
        },
        get: (f) => {
            return read(f)
        },
        exists: (f) => {
            return 
        },
        create: (f,v) => {
            /**
             * Code Key:
             * 0: Something went wrong. =- File already exists
             * 1: Created new file success
             */
            let u = create(f,v)
            if(u) {
                return 1
            } else {
                return 0
            }
        },
        arr_push: async (f,p,n) => {
            /**
             * Code Key:
             * 0: Something missing (Unexpected)
             * 1: All Good, Success
             * 2: Something went wrong (Non-Fatal/Possibly Expected) -= already contains value
             */
            let fn = await read(f)
            if(!fn) return 0;
            if(!fn[p]) return 0;
            if(fn[p].includes(n)) return 2;
            fn[p].push(n)
            rewrite(f,p,fn[p])
            return 1;
        },
        arr_pop: async (f,p,r) => {
            /**
             * Code Key:
             * 0: Something missing (Unexpected)
             * 1: All Good, Success
             * 2: Something went wrong (Non-Fatal/Possibly Expected) -= doesnt contain value
             */
            let fn = await read(f)
            if(!fn) return 0;
            if(!fn[p]) return 0;
            if(!fn[p].includes(r.toLowerCase())) return 2;
            fn[p] = fn[p].filter(x=>x.toLowerCase()!==r.toLowerCase())
            rewrite(f,p,fn[p])
            return 1
        },
        rw: (f,v) => {
            let fn = create(f,v)
            if(fn) return 1
            return 0
        },
        delete: (f) => {
            let r = del(f)
            if(r) return 1
            return 0
        }
    }
    //set dev
    client.setdev = () => {
        client.user.setPresence({game: { name: 'in development mode'}, status: 'dnd'})
    }
    //Edit embed
    client.setFooter = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).messages.fetch(msgid)
        .then(result => a = result)
        a.edit(new client.discord.MessageEmbed(a.embeds[0]).setFooter(newvalue))
    }
    client.setDescription = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).messages.fetch(msgid)
        .then(result => a = result)
        a.edit(new client.discord.MessageEmbed(a.embeds[0]).setDescription(newvalue))
    }
    client.setTitle = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).messages.fetch(msgid)
        .then(result => a = result)
        a.edit(new client.discord.MessageEmbed(a.embeds[0]).setTitle(newvalue))
    }
    client.update_count = () => {
        client.shard.fetchClientValues('guilds.size').then(results => {
            let aa = results.reduce((prev, guildCount) => prev + guildCount, 0)
            client.shard.broadcastEval(`const c = this.channels.get('512369661849894947'); if(c) c.setName("Server Count: ${aa}")`)
        })
    }
    //Send to bot channels
    client.c_log = (msg, embed) => {return new Promise(r=>client.u.sendMessage("399688995283533824", msg, embed).catch(er=>console.log("Error sending to log").then(r)))}
    // client.submit_ticket = async (ticid,message,iscensor,sent) => {
    //     let word = message.content.split(client.config.prefix +'ticket ')[1]
    //     client.shard.broadcastEval(`
    //         let tic = this.channels.get('509886529729200128')
    //         if(tic) {
    //             tic.send('TICKETID = ${ticid} : Word ticket > ${message.author} via ${sent}: ${message.content} || Match site: ${iscensor[1]}').then(msg=>{
    //                 client.db.table('tickets').insert({
    //                     id: '${ticid}',
    //                     author: '${message.author.id}',
    //                     ticmsg: msg.id,
    //                     word: '${word}'
    //                 }).run()
    //             })
    //         }
    //     `)
    // }

    client.c_ticket = async (msg) => {return await client.channels.get('509886529729200128').send(msg)}
    client.c_ticketlog = (msg) => {return new Promise(r=>client.u.sendMessage("517084909236649994", msg).catch(err=>{console.log('Error sending to ticketlog')}).then(r))}
    client.c_ticketbanned = (msg) => {return new Promise(r=>client.u.sendMessage("517088524730892308", msg).catch(err=>{console.log('Error sending to ticketbanned')}).then(r))}
    client.c_statuslog = (msg) => {return new Promise(r=>client.u.sendMessage("450444337357258772", msg).catch(err=>{console.log('Error sending to statuslog')}).then(r))}
    client.c_joinandleave = (msg) => {return new Promise(r=>client.u.sendMessage("456989243328299049", msg).catch(err=>{console.log('Error sending to joinandleave')}).then(r))}
    client.c_serverlist = (msg) => {return new Promise(r=>client.u.sendMessage("413831069117186078", msg).catch(err=>{console.log('Error sending to serverlist')}).then(r))}
    client.c_dms = (msg) => {return new Promise(r=>client.u.sendMessage("449658955073978389", msg).catch(err=>{console.log('Error sending to dms')}).then(r))}
}