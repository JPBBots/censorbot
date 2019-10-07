const config = {
    "prefix": "+",
    "name": "Censor Bot",
    "website": "https://censorbot.jt3ch.net/",
    "invitesite": "https://censorbot.jt3ch.net/invite.html",
    "donate": "https://paypal.me/jpbberry",
    "github": "https://github.com/jpbberry/censorbot",
    "dashboard": "https://censorbot.jt3ch.net/dash",
    "support": "https://discord.gg/CRAbk4w",
    "patreon": "https://www.patreon.com/censorbot",
    "dbl": "https://discordbots.org/bot/394019914157129728",
    "defaultMsg": "You're not allowed to say that...",
    "serverConfig": class BlankConfig {
        constructor(id, newOptions) {
            let brandNew = {
                "id": id,
                "censor": {
                    msg: true,
                    emsg: true,
                    nick: true,
                    react: true
                },
                "channels": [],
                "webhook": false,
                "base": true,
                "role": null,
                "log": "none",
                "filter": [],
                "msg": null,
                "pop_delete": 3000,
                "antighostping": false,
                "uncensor": [],
                "punishment": {
                    on: false,
                    amount: 3,
                    role: ""
                },
                ...newOptions
            }
            return brandNew
        }
    },
    premiumRoles: {
        "617037486719238185": 3,
        "621810419643973642": 1,
    }
}

module.exports = config;
