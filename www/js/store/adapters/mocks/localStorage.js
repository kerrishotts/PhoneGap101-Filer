let store = {};

function getItem(key) {
    return store[key];
}

function setItem(key, value) {
    store[key] = value.toString();
}

function removeItem(key) {
    delete store[key];
}

function clear() {
    store = {};
}

module.exports = {
    getItem,
    setItem,
    removeItem,
    clear,
    _data: store
};