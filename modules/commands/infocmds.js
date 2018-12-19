module.exports = async (client, command, args, message) => { 
    if (command == 'stats') {
        let m = await client.channels.get("514581361059954689").send("a")
        let stats = {
            "embed": {
                "title": client.config.name + " Stats",
                "description": client.config.name + " Is In " + client.guilds.size + " servers and serving " + client.users.size + " users!",
                "url": client.config.invitesite + "",
                "color": 14976715,
                "author": {
                    "name": client.config.name + "",
                    "url": client.config.website + "",
                    "icon_url": client.user.avatarURL + ""
                },
                "fields": [
                    {
                        "name": ":chart_with_downwards_trend: Memory Usage",
                        "value": (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB",
                        "inline": true
                    },
                    {
                        "name": ":envelope_with_arrow: Ping",
                        "value": m.createdTimestamp - message.createdTimestamp,
                        "inline": true
                    },
                    {
                        "name": ":incoming_envelope: API Latency",
                        "value": Math.round(client.ping) + "ms",
                        "inline": true
                    },
                    {
                        "name": ":couple: Support Server Members",
                        "value": client.guilds.get("399688888739692552").members.size,
                        "inline": true
                    },
                    {
                        "name": ":books: Library",
                        "value": "discord.js",
                        "inline": true
                    },
                    {
                        "name": ":desktop: Platform",
                        "value": require('os').platform(),
                        "inline": true
                    },
                    {
                        "name": client.emojis.get("514605672688779274").toString() + " Node Version",
                        "value": process.version,
                        "inline": true
                    },
                    {
                        "name": client.emojis.get("514606363545042955").toString() + " discord.js Version",
                        "value": require('discord.js').version,
                        "inline": true
                    },
                    {
                        "name": "Prefix",
                        "value": client.config.prefix,
                        "inline": true
                    }   
                ]
            }
        }
        m.delete()
        message.channel.send(stats)
    }
    if(command == "ping") {
        client.sendErr(message, "Run +stats to see ping")
    }
    if(command == "dashboard" || command == "dash") {
        message.reply('Check out the online settings dashboard here: https://censorbot.ml/dash')
    }
    if(command == "credits") {
        let credits = {
            "embed": {
              "title": "Credits",
              "url": "https://censorbot.ml/",
              "thumbnail": {
                "url": client.user.avatarURL
              },
              "fields": [
                {
                  "name": "Head Developer",
                  "value": "JPBBerry#5378 : [Twitter](https://twitter.com/jpbberry) - [Instagram](https://instagram.com/jpbberry) "
                },
                {
                  "name": "Debug Developer",
                  "value": "BillyTheBus#1552 : [Twitter](https://twitter.com/Mattwels04)"
                },
                {
                  "name": "Icon Art",
                  "value": "higbead#0871"
                },
                {
                  "name": "Translators",
                  "value": "English: Literally everyone\nSpanish: JPBBerry#5378\nPolish: Marcel#0473"
                }
              ]
            }
          }
          message.channel.send(credits)
    }
    if(command == "serverid") {
        message.reply("Your server ID: " + message.guild.id)
    }
}