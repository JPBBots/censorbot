const rethink = require("rethinkdbdash");
const dbi = require("./dbi.js");

class jdb {
    constructor() {
        this.db = rethink({
            port: 28015,
            host: "localhost",
            db: "server_data",
            silent: false,
            discovery: true
        })
    }

    get data() {
        return new dbi(this.db.table("data"));
    }

    get ticketer() {
        return new dbi(this.db.table("ticketer"));
    }

    get punish() {
        return new dbi(this.db.table("punishments"));
    }

    get config() {
        return BlankConfig
    }

    get ticket() {
        return new dbi(this.db.table("tickets"));
    }

    applyToObject(obj) {
        obj.rdb = this.data;
        obj.ticketerdb = this.ticketer;
        obj.punishdb = this.punish;
        obj.ticketdb = this.ticket;
    };
}

module.exports = new jdb();