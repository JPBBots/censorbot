module.exports = function(bot, connection, stuff, auth) {
    var SelfReloadJSON = require('self-reload-json');
    const modulename = "editedswearfilter"
    var byp = new SelfReloadJSON('./priv/filter.json');
    var statuslog = bot.channels.get("450444337357258772")
    var logchannel = bot.channels.get("399688995283533824")
    var serverlistchannel = bot.channels.get("413831069117186078")
    var botowner = bot.users.get("142408079177285632")




    bot.on('messageUpdate', async(newMessage, oldMessage, guild) => {
        if (!oldMessage.guild) return;
        if (oldMessage.channel.nsfw) return;
        if (oldMessage.guild.id == "264445053596991498") return;
        if (oldMessage.guild.id == "110373943822540800") return;
        if (oldMessage.author.bot) return;
        if (oldMessage.channel.id == "463137032177451008") return;



        async function stopped() {
            connection.query("SELECT * FROM censorbot WHERE serverid = " + oldMessage.guild.id, async function(err, rows) {
                if (rows && rows[0] && rows[0].censor == 0) {
                    return;
                } else {
                    connection.query("SELECT * FROM roleandlog WHERE serverid = " + oldMessage.guild.id, async function(err, rows) {
                        if (rows && rows[0]) {
                            let roleid = rows[0].roleid
                            let roleobject = oldMessage.guild.roles.get(roleid)
                            if (roleobject) {
                                if (oldMessage.guild.member(oldMessage.author.id).roles.has(roleid)) return;
                            }
                        }
                        oldMessage.delete().catch(err => {
                            console.log(`${oldMessage.guild.name} ${oldMessage.guild.id} Missing perms`)
                        })
                        const popnomsg = await oldMessage.reply("You're not allowed to say that... | Mistake? Do: +ticket word")
                        setTimeout(function() {
                            popnomsg.delete()
                        }, 3000);

                        console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)
                        const logchannel = bot.channels.get("399688995283533824")
                        logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)
                        const logchannelxd = oldMessage.guild.channels.find(c => c.name === "log");
                        if (!logchannelxd) {
                            oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")
                        }
                        if (logchannelxd) {
                            let yas = {
                                "embed": {
                                    "title": "Deleted Edited Message",
                                    "color": 16452296,
                                    "timestamp": "",
                                    "footer": {
                                        "icon_url": bot.user.avatarURL + "",
                                        "text": "If you believe this was a mistake run +ticket word"
                                    },
                                    "thumbnail": {
                                        "url": oldMessage.author.avatarURL
                                    },
                                    "fields": [{
                                        "name": "User",
                                        "value": oldMessage.author + "",
                                        "inline": true
                                    }, {
                                        "name": "Channel",
                                        "value": oldMessage.channel + "",
                                        "inline": true
                                    }, {
                                        "name": "Time",
                                        "value": Date() + ""
                                    }, {
                                        "name": "Message",
                                        "value": oldMessage.content + ""
                                    }]
                                }
                            }
                            logchannelxd.send(yas)
                        }
                    })
                }
            })
            return isstop = 1
        }

        if (oldMessage.content.match(/(f uck|fu ck|Pu.ssy|P.ussy|Puss.y|b i t c|b itc|d l c|dlc|c u n t|d 1 c|n l g|n!g|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|f.u.c|🇫🇺🇨|🇫 🇺 🇨|🇦🇸🇸|🇦 🇸 🇸|🇧🇮🇹🇨|🇧 🇮 🇹 🇨|🇩🇮🇨|🇩 🇮 🇨|🇨🇺🇳🇹|🇨 🇺 🇳 🇹|🇳🇮🇬|🇳 🇮 🇬|🇸🇭🇮🇹|🇸 🇭 🇮 🇹|🇫🇦🇬|🇫 🇦 🇬|🇵🇴🇷🇳|🇵 🇴 🇷 🇳|🇹🇮🇹|🇹 🇮 🇹|🇨🇴🇨|🇨 🇴 🇨|🇧🇦🇸🇹|🇧 🇦 🇸 🇹|🇸🇱🇺🇹|🇸 🇱 🇺 🇹|🇷🇪🇹🇦🇷🇩|🇷 🇪 🇹 🇦 🇷 🇩|🇵🇺🇸🇸🇾|🇵 🇺 🇸 🇸 🇾|🇨🇺🇲|🇨 🇺 🇲)/gi)) {
            stopped();
        }
        let RemoveAccents = require('../priv/removeaccents.js')

        const arg = RemoveAccents(oldMessage.content.replace(/[.]/g, '')).slice().trim().split(/ +/g)
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
        if (stop) stopped();
    })
}