const { Collection } = require("discord.js");

module.exports = async (client) => {
    const ipc = require("node-ipc")
    ipc.config.id = "cbShard"+client.shard.id;
    ipc.config.retry = 1000;
    ipc.config.silent = true;
    ipc.connectTo("censorbotmanager");
    client.restartShard = (id) => {
        ipc.of.censorbotmanager.emit("restart",{shard: id});
    }
    
    
    let fs = require('fs')
    const fetch = require('node-fetch')
    client.users.set("1", {
        id: '1',
        username: 'Clyde',
        discriminator: '0000',
        avatar: 'https://discordapp.com/assets/f78426a064bc9dd24847519259bc42af.png',
        bot: true
    })
    client.msgs = []
    const DBL = require("dblapi.js");
    const dbl = new DBL(client.config.dbltoken);
    client.dbl = dbl;
    const plotly = require('plotly')("censorbot", client.config.plotlyapi)
    console.log(`Shard ${client.shard.id} | >>> All Events Started, Bot Ready!`.bgRed)
    if (client.shard.id == client.shard.count - 1) {
        client.shard.fetchClientValues('guilds.size').then(results => {
            let gc = results.reduce((prev, guildCount) => prev + guildCount, 0)
            client.shard.broadcastEval(`this.user.setActivity('For Bad Words | ${gc} servers', {type: 'WATCHING'});`)
            // client.shard.broadcastEval(`this.user.setActivity('My development', {type: 'STREAMING', url: "https://twitch.tv/jpbberry"});`)
            client.shard.broadcastEval(`let g = this.channels.get('512369661849894947'); if(g) g.setName("Server Count: ${gc}")`)
            getStuff().then(me => {
                // require('../../assets/db.js').db.db("botinfo").table("bots").update({
                //     bot: "censorbot",
                //     server_count: gc,
                //     avatar: client.user.avatar,
                //     votes: me.points
                // }).run();
                fs.writeFileSync("C:/Workspace/websites/censorbot/stats.js", `document.getElementById("servercount").innerHTML = "${gc} SERVERS | ${me.points} VOTES"`);
                fetch(client.user.avatarURL())
                    .then(x => x.buffer())
                    .then(res => {
                        fs.writeFileSync("C:/Workspace/websites/censorbot/favicon.ico", res);
                    });
            });
        })
        client.shard.fetchClientValues('users.size').then(results => {
            let uc = results.reduce((prev, guildCount) => prev + guildCount, 0)
            global.uc = uc
        })
    }
    // client.user.setActivity('In development mode')
    // client.user.setStatus('dnd')
    function getStuff() {
        return new Promise((resolve) => {
            fetch("https://discordbots.org/api/bots/394019914157129728", {
                    method: "GET",
                    headers: {
                        Authorization: client.config.dbltoken
                    }
                })
                .then(x => x.json())
                .then(resolve)
        })
    }
    
    if(client.shard.id == 0) setInterval(async () => {
        let vv = await client.shard.fetchClientValues('guilds.size')
        dbl.postStats(vv);
        client.shard.fetchClientValues('guilds.size').then(results => {
            let aa = results.reduce((prev, guildCount) => prev + guildCount, 0)
            client.shard.broadcastEval(`this.user.setActivity("For Bad Words | ${aa} servers", {
                type: 'WATCHING'
            });`)
            // client.shard.broadcastEval(`this.user.setActivity("My Development!", {
            //     type: 'STREAMING',
            //     url: "https://twitch.tv/jpbberry"
            // });`)
            getStuff().then(me => {
                // require('../../assets/db.js').db.db("botinfo").table("bots").update({
                //     bot: "censorbot",
                //     server_count: aa,
                //     avatar: client.user.avatar,
                //     votes: me.points
                // }).run();
                fs.writeFileSync("C:/Workspace/websites/censorbot/stats.js", `document.getElementById("servercount").innerHTML = "${aa} SERVERS | ${me.points} VOTES"`);
                fetch(client.user.avatarURL())
                    .then(x => x.buffer())
                    .then(res => {
                        fs.writeFileSync("C:/Workspace/websites/censorbot/favicon.ico", res);
                    });
            })
        })
        // client.user.setActivity('In development mode')
        // client.user.setStatus('dnd')
        console.log(`Shard ${client.shard.id} | Updated ${vv.reduce((prev, guildCount) => prev + guildCount, 0)}`);
        
        client.shard.broadcastEval(`this.channels.forEach(x=>{if(x.messages) x.messages.clear()})`).then(a=>{
            client.msg("log", "Sweeped all messages");
        })
    }, 1800000);
    if (fs.existsSync('./r.json')) {
        let o = JSON.parse(fs.readFileSync('./r.json'))
        if (o) {
            if (o['shard'] != client.shard.id) return;
            let Discord = require('discord.js')
            let a = await client.channels.get(o['chan']).messages.fetch(o['mes'])
            let ok = new Discord.MessageEmbed()
                .setTitle('Restarted!')
                .setColor("GREEN")
                .setFooter("Success (Took: " + (((a.createdAt.getTime() - new Date().getTime()) * -1) / 1024).toFixed(2) + " seconds)")
            a.edit(ok)
            setTimeout(() => {
                a.delete()
            }, 5000);
        }
        fs.unlinkSync('./r.json')
        client.msg("statusLog", `${client.users.get(o['us']).username} signalled a manual shutdown. (Shard ${client.shard.id})`)
        console.log(`Shard ${client.shard.id} | >>> ${client.users.get(o['us']).username} signalled a manual shutdown.`.bgRed)
    } else {
        client.msg("statusLog", `Unexpected shutdown occured, restarted... (Shard ${client.shard.id})`)
        console.log(`Shard ${client.shard.id} | >>> Unexpected shutdown occured, restarted...`.bgRed)
    }
    const regions = {}
    client.guilds.array().forEach(g => regions[g.region] = (regions[g.region] || 0) + 1);
    var data = [{
        values: [regions['us-east'], regions['london'], regions['us-central'], regions['singapore'], regions['sydney'], regions['eu-central'], regions['us-west'], regions['us-south'], regions['eu-west'], regions['japan'], regions['hongkong'], regions['russia'], regions['brazil'], regions['southafrica']],
        labels: ['US East', 'London', 'US Central', 'Singapore', 'Sydney', 'Central Europe', 'US West', 'US South', 'Western Europe', 'Japan', 'Hong Kong', 'Russia', 'Brazil', 'South Africa'],
        type: 'pie',
        name: 'Censor Bot Region Demographics'
    }]
    var layout = {
        fileopt: "overwrite",
        filename: "censorbot-demographics",
        height: 400,
        width: 500
    };
}