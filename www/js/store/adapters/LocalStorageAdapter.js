const STORE = require("../../constants/store.js");

let localStorage = (typeof window !== "undefined" && window.localStorage) ||
  require("./mocks/localStorage.js");

class LocalStorageAdapter {
  constructor() {

  }

  save(uuid, data) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(uuid, JSON.stringify(data));
        resolve();
      } catch (err) {
        reject({
          code: STORE.CODES.JSON_STRINGIFY_ERROR,
          message: STORE.MESSAGES.JSON_STRINGIFY_ERROR,
          err,
          data
        });
      }
    });
  }

  load(uuid) {
    return new Promise((resolve, reject) => {
      let data = localStorage.getItem(uuid);
      if (data !== undefined && data !== null) {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject({
            code: STORE.CODES.JSON_PARSE_ERROR,
            message: STORE.MESSAGES.JSON_PARSE_ERROR,
            err,
            data
          })
        }
      } else {
        reject({
          code: STORE.CODES.ENTITY_NOT_FOUND,
          message: STORE.MESSAGES.ENTITY_NOT_FOUND,
          data: uuid
        });
      }
    });
  }

  remove(uuid) {
    return new Promise((resolve) => {
      localStorage.removeItem(uuid);
      resolve();
    });
  }

  getLocalStorage() {
    return localStorage;
  }

  static make() {
    return new LocalStorageAdapter();
  }
}

module.exports = LocalStorageAdapter;