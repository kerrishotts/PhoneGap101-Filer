const _subscribers = Symbol("_subscribers");

function _debounce(fn, ms = 1000, edge = 0) {
    let last = -1;
    let timerId;
    let that = this;

    function _trigger(...args) {
        let now = Date.now();
        switch (edge) {
            case 0:
                if (last < now - ms) {
                    last = now;
                    setTimeout(function() { fn.apply(that, args); }, 0);
                }
                break;
            case 1:
            default:
                if (timerId) {
                    clearTimeout(timerId);
                }
                timerId = setTimeout(() => {
                    setTimeout(function () { fn.apply(that, args); }, 0);
                    timerId = undefined;
                }, ms);
                break;
        }
    }

    return _trigger;
}

class Emitter {

    constructor({data, store} = {}) {
        this[_subscribers] = new Map();
    }

    /**
     * Subscribe to an event. The handler will be called with three parameters:
     * 
     *     sender: Object (this)
     *     event: string
     *     data: any
     * 
     * If debounce is a number, only one event within the given
     * timeframe (milliseconds) will trigger subscribers. If false,
     * subscribers are called for every event. If `edge` is zero, the first
     * event triggers the subscribers, whereas `egdge=1` will trigger only on the
     * last event. If debounce is a number, `blocking` is assumed to be `false`.
     * 
     * @param {string}   event                  event to which to subscribe
     * @param {Object}   that                   associated object
     * @param {function} handler                handler taking (sender, event, data)
     * @param {boolean}  [blocking=false]       if true, will execute this tick; otherwise next
     * @param {boolean|number} [debounce=false] if not false, calls are debounced per ms
     * @param {number}   [edge=0]               determines edge for debouncing; 0 = first, 1 = last
     * @returns {function} new handler if any wrapping was necessary
     * 
     * @memberOf Emitter
     */
    subscribe(event, that, handler, {blocking = false, debounce = false, edge = 0} = {}) {
        if (!that) {
            that = this;
        }

        let normalizedEventName = event.toLowerCase().trim();

        // ref is the object reference; if the object has a uuid, we'll assume that we can
        // use uuid as the reference instead of storing the entire object.
        let ref = that && that.uuid;
        if (!ref) {
            ref = that;
        }

        let eventMap = this[_subscribers].get(normalizedEventName);
        if (!eventMap) {
            eventMap = new Map();
            this[_subscribers].set(normalizedEventName, eventMap);
        }

        let thatSet = eventMap.get(ref);
        if (!thatSet) {
            thatSet = new Set();
            eventMap.set(ref, thatSet);
        }

        if (debounce !== false && debounce >= 0) {
            let debouncedHandler = _debounce.call(that, handler, debounce, edge);
            thatSet.add(debouncedHandler);
            return debouncedHandler;
        } else {
            let newHandler = blocking ? handler : function (...args) {
                return setTimeout(handler.bind(that, ...args), 0);
            };
            thatSet.add(newHandler);
            return newHandler;
        }
    }

    /**
     * Unsubscribe a handler from an event.
     * 
     * @param {string} event       event from which to unsubscribe
     * @param {object} that        Associated Object
     * @param {string} handler     handler method
     * @returns {void}
     * 
     * @memberOf Emitter
     */
    unsubscribe(event, that, handler) {
        let normalizedEventName = event.toLowerCase().trim();
        let ref = that && that.uuid;
        if (!ref) {
            ref = that;
        }

        let eventMap = this[_subscribers].get(normalizedEventName);
        if (!eventMap) {
            return;
        }

        let thatSet = eventMap.get(ref);
        if (!thatSet) {
            return;
        }

        if (!handler) {
            eventMap.delete(ref);
        } else {
            thatSet.delete(handler);
        }
    }

    /**
     * Generate an event, calling all subscribers. Call behavior is dependent
     * upon `blocking`. By default (false), subscribers will be called on the
     * next tick. If true, however, subscribers will be called within the current
     * tick.
     * 
     * 
     * @param {string} event
     * @param {any} data
     * @param {boolean} [blocking=false]
     * @returns {void}
     * 
     * @memberOf Emitter
     */
    emit(event, data, {blocking = false} = {}) {
        let normalizedEventName = event.toLowerCase().trim();
        let eventMap = this[_subscribers].get(normalizedEventName);
        if (!eventMap) {
            return;
        }

        let sender = this;
        eventMap.forEach(thatSet => {
            thatSet.forEach(handler => {
                if (typeof handler !== "function") {
                    return;
                }
                if (blocking) {
                    return handler(sender, event, data);
                } else {
                    return setTimeout(function() {
                        return handler(sender, event, data);
                    }, 0);
                }
            });
        });
    }

    static make() {
        return new Emitter();
    }

}

module.exports = Emitter;