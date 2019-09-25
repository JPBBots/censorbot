//db interface

function psmw(a) {
    return new Promise((r) => {
        a.toArray(function(err, result) {
            r(result);
        })
    })    
}

module.exports = class jdbi {
    constructor(table, r) {
        this.db = table;
        this.r = r;
    }
    async getAll(place) {
        if(!place) {
            return await psmw(this.db.find({}));
        } else {
            return (await psmw(this.db.find({id: place})))[0];
        }
    }
    async get(place, row) {
        return (await this.getAll(place))[row];
    }
    
    async update(place, obj) {
        return await this.db.updateOne(
            {id: place},
            {
                $set: obj || {}
            }
        )
    }
    async set(place, row, value) {
        let obj = {};
        obj[row] = value;
        return await this.update(place, obj);
    }
    async add(place, row, amount) {
        var obj = {};
        obj[row] = amount;
        return await this.db.updateOne(
            {id: place},
            {
                $inc: obj
            }
        )
    }
    async delete(place) {
        return await this.db.deleteOne({id: place});
    }
    
    async create(place, obj) {
        obj.id = place;
        return await this.db.insertOne(obj);
    }
    
    async replace(place, obj) {
        return await this.db.get(place).replace(obj).run();
    }
}