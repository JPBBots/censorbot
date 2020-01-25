const Request = require('/Workspace/req')

class PunishmentManager {
    constructor(db, token) {
        this.api = Request('https://discordapp.com/api/v7', { 'Authorization': `Bot ${token}` })
        this.db = db
    }
}

module.exports = PunishmentManager
