const Entity = require("../lib/Entity.js");
const PIECE = require("../constants/piece.js");

class Piece extends Entity {

  _overlay(data) {
    super._overlay(data);
    this.type =         (data && data.type)         || PIECE.PIECETYPE;
    this.title =        (data && data.title)        || "";
    this.content =      (data && data.content)      || "";
    this.color =        (data && data.color)        || "#000000";
    this.dateCreated =  (data && data.dateCreated)  || Date.now();
    this.dateModified = (data && data.dateModified) || Date.now();
    
    if (!(this.dateCreated instanceof Date)) {
      this.dateCreated = new Date(this.dateCreated);
    }
    
    if (!(this.dateModified instanceof Date)) {
      this.dateModified = new Date(this.dateModified);
    }
  }

  static make({data, store} = {}) {
    return new Piece({data, store});
  }
}

module.exports = Piece;