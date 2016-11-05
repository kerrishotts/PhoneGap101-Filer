const _subscribers = Symbol("_subscribers");
const DEBUG = true;

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
     * @param {string}   event
     * @param {function} handler
     * 
     * @memberOf Emitter
     */
    subscribe(event, handler, {blocking = false, debounce = false, edge = 0} = {}) {
        if (DEBUG) {
            console.log(`[EVENT SUBSCRIPTION] ${event} ${handler} blocking: ${blocking} debounce: ${debounce} edge: ${edge} this: ${JSON.stringify(this,null,2)}`);
        }
        let normalizedEventName = event.toLowerCase().trim();
        let eventSet = this[_subscribers].get(normalizedEventName);
        if (!eventSet) {
            eventSet = new Set();
            this[_subscribers].set(normalizedEventName, eventSet);
        }
        if (debounce !== false && debounce >= 0) {
            let debouncedHandler = _debounce.call(this, handler, debounce, edge);
            eventSet.add(debouncedHandler);
            return debouncedHandler;
        } else {
            let newHandler = blocking ? handler : function (...args) {
                if (DEBUG) {
                    console.log(`[EVENT HANDLER] ${event} ${handler} ${this} ${args}`);
                }
                return setTimeout(handler.bind(this, ...args), 0);
            };
            eventSet.add(newHandler);
            return newHandler;
        }
    }

    /**
     * Unsubscribe a handler from an event.
     * 
     * @param {string} event
     * @param {string} handler
     * @returns {void}
     * 
     * @memberOf Emitter
     */
    unsubscribe(event, handler) {
        let normalizedEventName = event.toLowerCase().trim();
        let eventSet = this[_subscribers].get(normalizedEventName);
        if (!eventSet) {
            return;
        }
        if (!handler) {
            this[_subscribers].delete(normalizedEventName);
        } else {
            eventSet.delete(handler);
        }
    }

    /**
     * Generate an event, calling all subscribers. Call behavior is dependent
     * upon `blocking`. By default (false), subscribers will be called on the
     * next tick. If true, however, subscribers will be called within the current
     * tick.
     * 
     * If debounce is a number, only one event within the given
     * timeframe (milliseconds) will trigger subscribers. If false,
     * subscribers are called for every event. If `edge` is zero, the first
     * event triggers the subscribers, whereas `egdge=1` will trigger only on the
     * last event. If debounce is a number, `blocking` is assumed to be `false`.
     * 
     * @param {string} event
     * @param {any} data
     * @param {boolean} [blocking=false]
     * @returns {void}
     * 
     * @memberOf Emitter
     */
    emit(event, data, {blocking = false} = {}) {
        if (DEBUG) {
            console.log(`[EVENT] ${event} ${data}`);
        }
        let normalizedEventName = event.toLowerCase().trim();
        let eventSet = this[_subscribers].get(normalizedEventName);
        if (!eventSet) {
            return;
        }

        let sender = this;

        eventSet.forEach(handler => {
            if (typeof handler !== "function") {
                if (DEBUG) { console.log(`[EVENT] ... ${handler} is not a function`); }
                return;
            }
            if (DEBUG) {
                console.log(`[EVENT] ... blocking: ${blocking}`);
                console.log(`[EVENT] ... Calling ${handler}`);
            }
            if (blocking) {
                return handler.call(this, sender, event, data);
            } else {
                return setTimeout(function() {
                    return handler.call(this, sender, event, data);
                }, 0);
            }
        });
    }

    static make() {
        return new Emitter();
    }

}

module.exports = Emitter;