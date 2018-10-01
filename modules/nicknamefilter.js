module.exports = function(bot, connection, stuff, auth) {
    var SelfReloadJSON = require('self-reload-json');
    const modulename = "nicknamefilter"
    var byp = new SelfReloadJSON('./priv/filter.json');
    var statuslog = bot.channels.get("450444337357258772")
    var logchannel = bot.channels.get("399688995283533824")
    var serverlistchannel = bot.channels.get("413831069117186078")
    var botowner = bot.users.get("142408079177285632")




    //
    bot.on('guildMemberUpdate', (newMember, oldMember, guild) => {



        if (oldMember.guild.id == "264445053596991498") return;
        if (oldMember.guild.id == "110373943822540800") return;


        async function stopped() {
            connection.query("SELECT * FROM censorbot WHERE serverid = " + oldMember.guild.id, async function(err, rows) {
                if (rows && rows[0] && rows[0].censor == 0) {
                    return;
                } else {
                    connection.query("SELECT * FROM roleandlog WHERE serverid = " + oldMember.guild.id, async function(err, rows) {
                        if (rows && rows[0]) {
                            let roleid = rows[0].roleid
                            let roleobject = oldMember.guild.roles.get(roleid)
                            if (roleobject) {
                                if (newMember.roles.has(roleid)) return;
                            }
                        }
                        oldMember.setNickname(' ').catch(err => {
                            console.log(`${guild.name} ${guild.id} Missing perms`)
                            return;
                        })
                        console.log(`Changed username of ${oldMember.id} because it was innapropriate ${oldMember.displayName}`)
                        const logchannel = bot.channels.get("399688995283533824")
                        logchannel.send(`Changed username of ${oldMember.id} because it was innapropriate`)


                        const logchannelxd = oldMember.guild.channels.find(c => c.name === "log");
                        if (!logchannelxd) {

                            return;

                        }

                        if (logchannelxd) {
                            let yas = {
                                "embed": {
                                    "title": "Changed Innapropriate Nickname",
                                    "color": 16452296,
                                    "timestamp": "",
                                    "footer": {
                                        "icon_url": bot.user.avatarURL + "",
                                        "text": "If you believe this was a mistake run +ticket word"
                                    },
                                    "thumbnail": {
                                        "url": oldMember.avatarURL
                                    },
                                    "fields": [{
                                        "name": "User",
                                        "value": oldMember + "",
                                        "inline": true
                                    }, {
                                        "name": "Time",
                                        "value": Date() + ""
                                    }, {
                                        "name": "Nickname",
                                        "value": oldMember.displayName + ""
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

        if (oldMember.displayName.match(/(f uck|fu ck|Pu.ssy|P.ussy|Puss.y|b i t c|b itc|d l c|dlc|c u n t|d 1 c|n l g|n!g|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|f.u.c|🇫🇺🇨|🇫 🇺 🇨|🇦🇸🇸|🇦 🇸 🇸|🇧🇮🇹🇨|🇧 🇮 🇹 🇨|🇩🇮🇨|🇩 🇮 🇨|🇨🇺🇳🇹|🇨 🇺 🇳 🇹|🇳🇮🇬|🇳 🇮 🇬|🇸🇭🇮🇹|🇸 🇭 🇮 🇹|🇫🇦🇬|🇫 🇦 🇬|🇵🇴🇷🇳|🇵 🇴 🇷 🇳|🇹🇮🇹|🇹 🇮 🇹|🇨🇴🇨|🇨 🇴 🇨|🇧🇦🇸🇹|🇧 🇦 🇸 🇹|🇸🇱🇺🇹|🇸 🇱 🇺 🇹|🇷🇪🇹🇦🇷🇩|🇷 🇪 🇹 🇦 🇷 🇩|🇵🇺🇸🇸🇾|🇵 🇺 🇸 🇸 🇾|🇨🇺🇲|🇨 🇺 🇲)/gi)) {
            stopped();
        }
        let RemoveAccents = require('../priv/removeaccents.js')

        const arg = RemoveAccents(oldMember.displayName.replace(/[.]/g, '')).slice().trim().split(/ +/g)
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