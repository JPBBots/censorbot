module.exports = function(bot, connection, stuff, auth) {
    var SelfReloadJSON = require('self-reload-json');

    const modulename = "swearfilter"

    var statuslog = bot.channels.get("450444337357258772")
    var logchannel = bot.channels.get("399688995283533824")
    var serverlistchannel = bot.channels.get("413831069117186078")
    var botowner = bot.users.get("142408079177285632")
    var byp = new SelfReloadJSON('./priv/filter.json');


    bot.on('message', async(message) => {
        if (!message.guild) return;
        if (message.channel.nsfw) return;
        if (message.guild.id == "264445053596991498") return;
        if (message.guild.id == "110373943822540800") return;
        if (message.author.bot) return;
        if (message.channel.id == "463137032177451008") return;
        if (message.channel.id == "362693179033649152" || message.channel.id == "410475762257494016" || message.channel.id == "362689481586901002" || message.channel.id == "467069321768730624") return;
        if (message.guild.id == "446519010935439371") {
            if (message.content.match(/slut/)) return;
        }
        if (message.guild.id == "468235532497977355") {
            if (message.content.match(/porn/)) return;
        }
        if (message.guild.id == "430410558681120768") {
            if (message.content.match(/frigger/)) stopped();
            if (message.content.match(/twat/)) stopped();
        }


        async function stopped(arg, words) {
            connection.query("SELECT * FROM censorbot WHERE serverid = " + message.guild.id, async function(err, rows) {
                if (rows && rows[0] && rows[0].censor == 0) {
                    return;
                } else {
                    connection.query("SELECT * FROM roleandlog WHERE serverid = " + message.guild.id, async function(err, rows) {
                        if (rows && rows[0]) {
                            let roleid = rows[0].roleid
                            let roleobject = message.guild.roles.get(roleid)
                            if (roleobject) {
                                if (message.guild.member(message.author.id).roles.has(roleid)) return;
                            }
                        }


                        message.delete().catch(err => {
                            console.log(`${message.guild.name} ${message.guild.id} Missing perms`)
                        })
                        const popnomsg = await message.reply("You're not allowed to say that... | Mistake? Do: +ticket word")
                        setTimeout(function() {
                            popnomsg.delete()
                        }, 3000);

                        console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
                        const logchannel = bot.channels.get("399688995283533824")
                        let oml = {
                            "embed": {
                                "title": message.content + "",
                                "footer": {},
                                "fields": [{
                                    "name": "User",
                                    "value": message.author + ""
                                }, {
                                    "name": "Match site + Swear Array Match",
                                    "value": arg + " + " + words
                                }]
                            }
                        }
                        logchannel.send(`Deleted message from ${message.author.tag} ${message.author.username}: | Server: ${message.guild.name} ${message.guild.id} | Channel: ${message.channel.name} ${message.channel.id}`)
                        logchannel.send(oml)
                        const logchannelxd = message.guild.channels.find(c => c.name === "log");
                        if (!logchannelxd) {
                            message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")
                        }
                        if (logchannelxd) {
                            let yas = {
                                "embed": {
                                    "title": "Deleted Message",
                                    "color": 16452296,
                                    "timestamp": "",
                                    "footer": {
                                        "icon_url": bot.user.avatarURL + "",
                                        "text": "If you believe this was a mistake run +ticket word"
                                    },
                                    "thumbnail": {
                                        "url": message.author.avatarURL
                                    },
                                    "fields": [{
                                        "name": "User",
                                        "value": message.author + "",
                                        "inline": true
                                    }, {
                                        "name": "Channel",
                                        "value": message.channel + "",
                                        "inline": true
                                    }, {
                                        "name": "Time",
                                        "value": Date() + ""
                                    }, {
                                        "name": "Message",
                                        "value": message.content + ""
                                    }]
                                }
                            }
                            logchannelxd.send(yas)
                        }

                    })
                };
            });
        }

        if (message.content.match(/(f uck|fu ck|penis|Pu.ssy|P.ussy|Puss.y|d l c|dlck|c u n t|n l g|n!g|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|ðŸ‡«ðŸ‡ºðŸ‡¨|ðŸ‡«.+ðŸ‡¨|ðŸ‡« ðŸ‡º ðŸ‡¨|ðŸ‡¦ðŸ‡¸ðŸ‡¸|ðŸ‡¦ ðŸ‡¸ ðŸ‡¸|ðŸ‡§ðŸ‡®ðŸ‡¹ðŸ‡¨|ðŸ‡§ ðŸ‡® ðŸ‡¹ ðŸ‡¨|ðŸ‡©ðŸ‡®ðŸ‡¨|ðŸ‡© ðŸ‡® ðŸ‡¨|ðŸ‡¨ðŸ‡ºðŸ‡³ðŸ‡¹|ðŸ‡¨ ðŸ‡º ðŸ‡³ ðŸ‡¹|ðŸ‡³ðŸ‡®ðŸ‡¬|ðŸ‡³ ðŸ‡® ðŸ‡¬|ðŸ‡¸ðŸ‡­ðŸ‡®ðŸ‡¹|ðŸ‡¸ ðŸ‡­ ðŸ‡® ðŸ‡¹|ðŸ‡«ðŸ‡¦ðŸ‡¬|ðŸ‡« ðŸ‡¦ ðŸ‡¬|ðŸ‡µðŸ‡´ðŸ‡·ðŸ‡³|ðŸ‡µ ðŸ‡´ ðŸ‡· ðŸ‡³|ðŸ‡¹ðŸ‡®ðŸ‡¹|ðŸ‡¹ ðŸ‡® ðŸ‡¹|ðŸ‡¨ðŸ‡´ðŸ‡¨|ðŸ‡¨ ðŸ‡´ ðŸ‡¨|ðŸ‡§ðŸ‡¦ðŸ‡¸ðŸ‡¹|ðŸ‡§ ðŸ‡¦ ðŸ‡¸ ðŸ‡¹|ðŸ‡¸ðŸ‡±ðŸ‡ºðŸ‡¹|ðŸ‡¸ ðŸ‡± ðŸ‡º ðŸ‡¹|ðŸ‡·ðŸ‡ªðŸ‡¹ðŸ‡¦ðŸ‡·ðŸ‡©|ðŸ‡· ðŸ‡ª ðŸ‡¹ ðŸ‡¦ ðŸ‡· ðŸ‡©|ðŸ‡µðŸ‡ºðŸ‡¸ðŸ‡¸ðŸ‡¾|ðŸ‡µ ðŸ‡º ðŸ‡¸ ðŸ‡¸ ðŸ‡¾|ðŸ‡¨ðŸ‡ºðŸ‡²|ðŸ‡¨ ðŸ‡º ðŸ‡²)/gi)) {
            stopped("general stopped", "general stopped");
        }
        let RemoveAccents = require('../priv/removeaccents.js')

        const arg = RemoveAccents(message.content.replace(/[.]/g, '')).slice().trim().split(/ +/g)
        const words = Object.keys(byp)

        const arrays = byp

        let okaytt = []
        let okayy = []
        let stop = false
        arg.forEach(arg => {
            words.forEach(words => {
                let word = new RegExp(words, 'gi')
                if (arg.match(word)) {
                    const array = arrays[words.toLowerCase()]
                    stop = true
                    okaytt = word
                    okayaa = arg
                    array.forEach(bypass => {
                        let sio = new RegExp(bypass, 'gi')
                        if (arg.match(sio)) {
                            stop = false
                        }
                    })
                }
            })
        })
        if (stop) {
            stopped(okayaa, okaytt);
        }


    });
}