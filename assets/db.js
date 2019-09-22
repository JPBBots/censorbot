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
        return new dbi(this.db.table("data"), this.db);
    }

    get ticketer() {
        return new dbi(this.db.table("ticketer"), this.db);
    }

    get punish() {
        return new dbi(this.db.table("punishments"), this.db);
    }

    get config() {
        return BlankConfig
    }

    get ticket() {
        return new dbi(this.db.table("tickets"), this.db);
    }
    
    get premium() {
        return new dbi(this.db.table("premium"), this.db)
    }

    get voter() {
         return new dbi(this.db.table("voters"), this.db)
    }
    
    get premiumuser() {
        return new dbi(this.db.table("premiumusers"), this.db);
    }
    
    get rawdb() {
        return this.db;
    }

    applyToObject(obj) {
        obj.rdb = this.data;
        obj.ticketerdb = this.ticketer;
        obj.punishdb = this.punish;
        obj.ticketdb = this.ticket;
        obj.pdb = this.premium;
        obj.vdb = this.voter;
        obj.pudb = this.premiumuser;
        obj.rawdb = this.rawdb;
    };
}

module.exports = new jdb();