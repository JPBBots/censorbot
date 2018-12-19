module.exports = async (client, message) => {
    if(message.content.toLowerCase().split(' ')[0] == client.config.prefix + "ticket") {
        message.delete();
        return;
    }
    if(message.content.toLowerCase().split(' ')[0] == client.config.prefix + "filter") {
        message.delete();
        return;
    }
    if(message.channel.nsfw) return;
    if(message.member) {
    if(!client.q_censored(message.member)) return;
    }
    let arg = client.RemoveAccents(message.content).slice().trim().split(/ +/g)
    let attachments = message.attachments.map(x=>x.filename)
    if(attachments.length > 0) {
        attachments.forEach(a => {
            arg.push(a.replace(/(_|.)/g, " "))
        })
    } 
    let filter_result = await require('./filter.js')(client, arg, message.guild)
    if(filter_result === false) return;

            async function stopped(arg, words, method) {
                    let err = ""
                    try {
                        await message.delete()
                    } catch(error) {
                        console.log(`${message.guild.name} ${message.guild.id} Missing perms`)
                        err = "\n\nError! Missing permission to manage messages."
                    }
                            let tikme = ""
                            let tikem = ""
                        if(method == "base") {
                            tikme = "Mistake? Do +ticket"
                            tikem = "If you believe this was a mistake run +ticket"
                        }
                        if(method == "server") {
                            tikme = "Custom server filter, (Contact server owner if mistake)"
                            tikem = "Custom Server Filter"
                        }
                    try {
                        const popnomsg = await message.reply("You're not allowed to say that... | " + tikme)
                        setTimeout(function() {
                            popnomsg.delete()
                        }, 3000);
                    } catch(error) {
                        if(error) {
                            return;
                        }
                    }
                    console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
                    let content = ""
                    if(message.content !== 0) {
                    if(message.content.length > 256) {
                        content = "Message too long to include in embed!"
                    } else {
                        content = message.content
                    }
                }
                    if(message.attachments.map(x=>x.filename).length > 0 && message.content == 0) {
                        content = "File: " + message.attachments.map(x=>x.filename)[0]
                    }
                    let oml = {
                        "embed": {
                            "title": content + "",
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
                    client.c_log(`Deleted message from ${message.author.tag} ${message.author.username}: | Server: ${message.guild.name} ${message.guild.id} | Channel: ${message.channel.name} ${message.channel.id}`)
                    client.c_log(oml)
                    let logc = client.q_log(message.guild)
                    if (!logc) {
                        client.sendErr(message, "Error no log channel found! Do +setlog in the desired log channel")
                    }
                    let avatar = ""
                    if(!message.author.avatarURL) {
                        avatar = "http://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png"
                    } else {
                        avatar = message.author.avatarURL
                    }
                    if (logc) {
                        let yas = {
                            "embed": {
                                "title": "Deleted Message" + err,
                                "color": 16452296,
                                "timestamp": "",
                                "footer": {
                                    "icon_url": client.user.avatarURL + "",
                                    "text": tikem + ""
                                },
                                "thumbnail": {
                                    "url": avatar + ""
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
                                    "value": content + ""
                                }]
                            }
                        }
                        client.channels.get(logc).send(yas)
                    }          
    }
    stopped(filter_result[0], filter_result[1], filter_result[2])
}