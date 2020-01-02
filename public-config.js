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
                "log": null,
                "filter": [],
                "msg": null,
                "pop_delete": 3000,
                "antighostping": false,
                "uncensor": [],
                "punishment": {
                    on: false,
                    amount: 3,
                    role: null
                },
                ...newOptions
            }
            return brandNew
        }
    },
    premiumRoles: {
        "617037486719238185": 3, // patron
        "621810419643973642": 1, // booster
        "651523919962177546": 1, // premium
        "623947910274482177": 1, // senior helper
        "623847890628116504": 99 // head helper
    }
}

module.exports = config;
