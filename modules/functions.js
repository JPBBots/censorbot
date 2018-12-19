module.exports = (client) => {
    let Discord = require('discord.js')
    //Remove accents function
    client.RemoveAccents = (str) => {
          var accents = "PRIVATE"
          var accentsOut = "PRIVATE";
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
    client.arrHas = (str, arr) => {
        return (arr.indexOf(str) > -1)
    }
    //Test if message should be censored (for cenor i/o and uncensor role)
    client.q_censored = (mem) => {
        let guild = mem.guild
	try {
        JSON.parse(fs.readFileSync('./data/server_data/' + guild.id + '.json'))
    } catch (e) {
        console.log(guild.id)
        fs.writeFile('./data/server_data/' + guild.id + '.json', '{"censor":"1","role":"none","log":"none","filter":[]}')
	return;
    }
    let serverdat = JSON.parse(fs.readFileSync('./data/server_data/' + guild.id + '.json'))
    if(!serverdat) {
        fs.writeFile('./data/server_data/' + guild.id + '.json', '{"censor":"1","role":"none","log":"none","filter":[]}')
        serverdat = '{"censor":"1","role":"none","log":"none","filter":[]}'
    }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + guild.id + '.json'))
        let c = true
        if(serverdata['censor'] === 0) c = false
        let roleobject = guild.roles.get(serverdata['role'])
        if(roleobject) {
            if(mem.roles.has(serverdata['role'])) c = false
        }
        return c;
    }
    //Get guilds log channel
    client.q_log = (g) => {
        try {
            JSON.parse(fs.readFileSync('./data/server_data/' + g.id + '.json'))
        } catch(err) {
            return false;
        }
        let sdata = JSON.parse(fs.readFileSync('./data/server_data/' + g.id + '.json'))
        let glog = sdata['log']
        if(glog === "none") return false;
        if(!client.channels.get(glog)) {
            sdata['log'] = "none"
            fs.writeFile('./data/server_data/' + g.id + '.json', JSON.stringify(sdata), (error) => {
                if(error) {
                    console.log(error)
                }
            })
            return false;
        }
        return glog;
    }
    //array func
    Array.prototype.contains = function(element){
        return this.indexOf(element) > -1;
    };
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
    //Reload config
    client.reloadConfig = () => {
        delete require.cache[require.resolve(`../config.js`)];
        client.config = require('../config.js')
        return;
    }
    //Reload filter
    client.reloadFilter = () => {
        console.log("Unloading filter...")
        client.unloadFilter()
            .then(res => { if(res == true) {
                console.log("Unloaded! Reloading...")
                client.loadFilter()
                    .then(res => { if(res == true) {
                        console.log("Reload successful!")
                        return true;
                    } else {
                        console.log("Error loading back the filter! ; " + res)
                        return res;
                    } })
            } else {
                console.log("Error unloading the filter! ; " + res)
                return res;
            } })
    }
    client.unloadFilter = async () => {
        try {
        delete require.cache[require.resolve('../modules/filter/filter.json')]
        delete client.filterfile
        } catch(error) {
            return error.message
        }
        return true;
    }
    client.loadFilter = async () => {
        try {
        client.filterfile = require('../modules/filter/filter.json')
        } catch(error) {
            return error.message
        }
        return true;
    }
    //If admin
    client.isAdmin = (userid) => {
        return client.config.admins.contains(userid)
    }
    //^ for msg
    client.MisAdmin = (msg) => {
        return client.config.admins.contains(msg.author.id)
    }
    //RichEmbed Error
    client.sendErr = async (msg, errormessage) => {
        let o = new Discord.RichEmbed()
        .setColor("DARK_RED")
        .setTitle(errormessage)
        .setFooter("Command Ran by " + msg.author.username)
        let me = await msg.channel.send(o)
        setTimeout(() => {
            me.delete()
        }, 4000);
        return true
    } 
    //RichEmbed Success
    client.sendSuccess = async (msg, successmessage, foot) => {
        let o = new Discord.RichEmbed()
        .setColor("DARK_GREEN")
        .setTitle(successmessage)
        .setFooter(foot)
        let me = await msg.channel.send(o)
        setTimeout(() => {
            me.delete()
        }, 6000);
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
    //Edit embed
    client.setFooter = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).fetchMessage(msgid)
        .then(result => a = result)
        a.edit(new client.discord.RichEmbed(a.embeds[0]).setFooter(newvalue))
    }
    client.setDescription = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).fetchMessage(msgid)
        .then(result => a = result)
        a.edit(new client.discord.RichEmbed(a.embeds[0]).setDescription(newvalue))
    }
    client.setTitle = async (msgchannel, msgid, newvalue) => {
        await client.channels.get(msgchannel).fetchMessage(msgid)
        .then(result => a = result)
        a.edit(new client.discord.RichEmbed(a.embeds[0]).setTitle(newvalue))
    }
    //Send to bot channels
    client.c_log = (msg) => {client.channels.get("CHANNEL").send(msg)}
    client.c_ticket = async (msg) => {return await client.channels.get("CHANNEL").send(msg)}
    client.c_ticketlog = (msg) => {client.channels.get('CHANNEL').send(msg)}
    client.c_ticketbanned = (msg) => {client.channels.get("CHANNEL").send(msg)}
}
