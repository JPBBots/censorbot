//db interface

module.exports = class jdbi {
    constructor(table, r) {
        this.db = table;
        this.r = r;
    }
    async getAll(place) {
        if(!place) {
            return await this.db.run();
        } else {
            return await this.db.get(place).run();
        }
    }
    async get(place, row) {
        return await this.db.get(place)(row).run();
    }
    
    async update(place, obj) {
        return await this.db.get(place).update(obj).run();
    }
    async set(place, row, value) {
        let obj = {};
        obj[row] = value;
        return await this.update(place, obj);
    }
    async add(place, row, amount) {
        let obj = {};
        obj[row] = this.r.row(row).add(amount);
        return await this.db.get(place).update(obj).run()
    }
    async delete(place) {
        return await this.db.get(place).delete().run()
    }
    
    async create(place, obj) {
        obj.id = place;
        return await this.db.insert(obj).run()
    }
    
    async replace(place, obj) {
        return await this.db.get(place).replace(obj).run();
    }
}