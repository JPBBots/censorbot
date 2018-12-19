module.exports = async (client, oldMember, newMember) => {
    if(oldMember.displayName == newMember.displayName) return;
    if(!client.q_censored(newMember)) return;
    let arg = client.RemoveAccents(newMember.displayName).slice().trim().split(/ +/g)
    let filter_result = require('./filter.js')(client, arg, newMember.guild)
    if(filter_result === false) return;
    async function stopped(method) {
        let error = ""
        let guild = oldMember.guild
        let nickn = newMember.displayName
        try {
           await oldMember.setNickname(oldMember.displayName)
        } catch (err) {
            console.log(`${guild.name} ${guild.id} Missing perms`)
            error = "\n\nError! Missing permission to change this users nickname!"
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
        console.log(`Changed username of ${oldMember.id} because it was innapropriate ${newMember.displayName}`)
        client.c_log(`Changed username of ${oldMember.id} because it was innapropriate`)
        let logc = client.q_log(newMember.guild)    
        if (logc == "none") {
            return;
        }
        let avatar = ""
        if(!oldMember.user.avatarURL) {
            avatar = "http://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png"
        } else {
            avatar = oldMember.user.avatarURL
        }
        if (logc) {
            let yas = {
                "embed": {
                    "title": "Changed Innapropriate Nickname " + error,
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
                        "value": oldMember + "",
                        "inline": true
                    }, {
                        "name": "Time",
                        "value": Date() + ""
                    }, {
                        "name": "Nickname",
                        "value": nickn + ""
                    }]
                }
            }
        client.channels.get(logc).send(yas)
        }
        return isstop = 1
    }
    stopped(filter_result[2]).catch(err => {
        console.log(`${guild.name} ${guild.id} Missing perms`)
    })
}