module.exports = async (client, oldMessage, newMessage) => {
    if(oldMessage.channel.nsfw) return;
    if(!client.q_censored(oldMessage.member)) return;
    let arg = client.RemoveAccents(newMessage.content).slice().trim().split(/ +/g)
    let filter_result = require('./filter.js')(client, arg, oldMessage.guild)
    if(filter_result === false) return;
    async function stopped(method) {
                    oldMessage.delete().catch(err => {
                        console.log(`${oldMessage.guild.name} ${oldMessage.guild.id} Missing perms`)
                    })
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
                    const popnomsg = await oldMessage.reply("You're not allowed to say that... | " + tikme)
                    setTimeout(function() {
                        popnomsg.delete()
                    }, 3000);

                    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${newMessage.content}`)
                    client.c_log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${newMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)
                    let logc = client.q_log(oldMessage.guild)
                    if (!logc) {
                        client.sendErr(oldMessage, "Error no log channel found! Do +setlog in the desired log channel")
                    }
                    let avatar = ""
                    if(!oldMessage.author.avatarURL) {
                        avatar = "http://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png"
                    } else {
                        avatar = oldMessage.author.avatarURL
                    }
                    if (logc) {
                        let yas = {
                            "embed": {
                                "title": "Deleted Edited Message",
                                "color": 16452296,
                                "timestamp": "",
                                "footer": {
                                    "icon_url": client.user.avatarURL + "",
                                    "text": tikem + ""
                                },
                                "thumbnail": {
                                    "url": avatar
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
                                    "name": "Before Edit",
                                    "value": oldMessage.content + ""
                                }, {
                                    "name": "After Edit",
                                    "value": newMessage.content + "",
                                    "inline": true
                                }]
                            }
                        }
                        client.channels.get(logc).send(yas)
                    }
        return isstop = 1
    }
    stopped(filter_result[2])
}