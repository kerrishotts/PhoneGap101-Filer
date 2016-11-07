const _store = Symbol("_store");    // used to keep private properties really private
const _subscribers = Symbol("_subscribers");

const Emitter = require("./Emitter.js");

/**
 * Entity is the base object for all persistable items in Filer. It provides the
 * basic mechanism for saving and loading data (with associated store), the
 * ability to serialize and deserialize data, and the ability to subscribe to
 * and generate events when something changes in the model.
 * 
 * @class Entity
 */
class Entity extends Emitter {

    /**
     * Creates an instance of Entity.
     * 
     * @param {any} [{data, store}={}]
     * 
     * @memberOf Entity
     */
    constructor({data, store} = {}) {
        super();

        this[_store] = store;

        if (typeof data === "string") {
            // if incoming data is a string, deserialize/unmarshall from
            // the string.
            this.deserialize(data);
        } else if (data instanceof Object) {
            // if the incoming data is an object, merge in the supported
            // properties.
            this._overlay(data);
        } else {
            // if no data has been provided, use the defaults -- _overlay
            // with no incoming object will do just that.
            this._overlay({});
        }
    }

    set(key, value) {
        let oldValue = this[key];
        this[key] = value;
        this.emit(`${key}-changed`, {"to": value, "from": oldValue});
        this.emit(`changed`, {key, "to": value, "from": oldValue});
    }

    get(key) {
        return this[key];
    }

    /**
     * Return the associated store for this model.
     * 
     * @memberOf Entity
     */
    getStore() {
        return this[_store];
    }

    /**
     * Overlay `data` into this instance. If the incoming object does not provide
     * one of the requested properties, a default value will be provided instead.
     * 
     * Note: subclasses should override this as appropriate
     * 
     * @param {Object} data
     * 
     * @memberOf Entity
     * @private
     */
    _overlay(data) {
        this.uuid = (data && data.uuid) || Entity.makeUniqueIdentifier();
    }

    /**
     * Deserialize/unmarshal the object from the provided string.
     * 
     * @param {string} data
     * 
     * @memberOf Entity
     * @throws Error
     */
    deserialize(data) {
        var parsedObject;
        try {
            parsedObject = JSON.parse(data);
        } catch (err) {
            throw new Error("Could not parse JSON", err);
        }

        // data was parsed successfully, overlay it on this instance
        this._overlay(parsedObject);
        this.emit("changed");
    }

    /**
     * Serialize/marshal the model to a string. If prettify is true, it will 
     * generate indended layout.
     * 
     * @param {any} [{prettify = true}={}]
     * @returns string
     * 
     * @memberOf Entity
     * @throws Error
     */
    serialize({prettify = true} = {}) {
        let entity = this.declassify();
        if (this._preSerialize) {
            this._preSerialize(entity);
        }
        try {
            return prettify ? JSON.stringify(entity, null, 2)
                            : JSON.stringify(entity);
        } catch (err) {
            throw new Error("Could not stringify object", err);
        }
    }

    /**
     * This method will process the incoming entity and provide any necessary
     * transformations in order to make the entity serializable. This might, for
     * example, mean mapping an array of items to an array of UUIDs.
     * 
     * Note: subclasses should override this method as appropriate.
     * 
     * @param {any} entity
     * @returns {void}
     * 
     * @memberOf Entity
     * @private
     */
    _preSerialize(entity) {
        return;
    }

    /**
     * Saves the model to persistent storage.
     * 
     * @returns Promise
     * 
     * @memberOf Entity
     */ 
    save() {
        let entity = this.declassify();
        if (this._preSerialize) {
            this._preSerialize(entity);
        }
        return this[_store].save(this.uuid, entity);
    }

    /**
     * Loads the model from persistent storage. In order to do this effectively
     * make sure that uuid is set prior, or you'll load a random (and probably nonexistant)
     * entity.
     * 
     * @returns Promise<Entity>
     * 
     * @memberOf Entity
     */
    load() {
        return this[_store].load(this.uuid).then(data => {
            this._overlay(data);
            this.emit("changed");
        });
    }

    /**
     * Returns a deep clone of the entity so that it can be modified prior to
     * serialization. Useful for other similar situations, however.
     * 
     * The name comes from the fact that the resulting object is not an instance
     * of Entity, but rather of Object. Since we're removing the instance's class
     * membership, the name "Declassify" made sense.
     * 
     * Note: symbols are automatically removed from the return object.
     * 
     * @param {any} [obj]
     * @returns Object
     * 
     * @memberOf Entity
     */
    declassify(obj, lvl = 0) {
        if (lvl > 50) {
            throw new Error ("trying to declassify too deeply!");
        }
        let that = lvl === 0 ? obj || this : obj;
        let isThatAnArray = (that instanceof Array);
        let entity = isThatAnArray ? [] : {};

        if (that === undefined || that === null) {
            return;
        }

        if (that instanceof Date) {
            // we need dates to be immutable, not references
            return new Date(that);
        }

        if (typeof that === "string") {
            // make a new string
            return "" + that;
        }

        let ownProps = Object.getOwnPropertyNames(that);
        if (ownProps.length > 0 && (that instanceof Object)) {
            let v;
            for (let k of ownProps) {
                v = that[k];

                // there are some keys and property types that
                // we need to exclude
                if (isThatAnArray && k === "length") continue;
                if (v instanceof Function) continue;

                entity[k] = this.declassify(v, lvl + 1);
            }
            return entity;
        } else {
            return that;
        }
    }

    /// mark: static methods
    static declassify(original) {
        return original.declassify();
    }

    /**
     * Utility method to create a UUID for entities. NOT GUARANTEED TO BE UNIQUE
     * in this instance, however it is sufficient for our purposes here.
     * 
     * @static
     * @returns string
     * 
     * @memberOf Entity
     */
    static makeUniqueIdentifier() {
        // http://stackoverflow.com/a/2117523/741043
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static make({data, store} = {}) {
        return new Entity({ data, store });
    }

}

module.exports = Entity;