const Emitter = require("../lib/Emitter.js");

const _adapter = Symbol("_adapter");

class EntityStore extends Emitter {
    constructor(adapter) {
        super();
        this[_adapter] = adapter;
    }
    
    save(uuid, data) {
        return this[_adapter].save(uuid, data).then(() => this.emit("savedEntity", uuid));
    }
    
    load(uuid) {
        return this[_adapter].load(uuid).then((data) => {
            this.emit("loadedEntity", uuid);
            return data;
        });
    }
    
    remove(uuid) {
        return this[_adapter].remove(uuid).then(() => this.emit("removedEntity", uuid));
    }
    
    static make(adapter) {
        return new EntityStore(adapter);
    }
}

module.exports = EntityStore;