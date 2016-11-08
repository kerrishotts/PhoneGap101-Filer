const Entity = require("../lib/Entity.js");
const PIECE = require("../constants/piece.js");

class Piece extends Entity {

  _overlay(data) {
    super._overlay(data);
    this.type =         (data && data.type)         || PIECE.PIECETYPE;
    this.title =        (data && data.title)        || "";
    this.content =      (data && data.content)      || "";
    this.color =        (data && data.color)        || "inherit";
    this.dateCreated =  (data && data.dateCreated)  || Date.now();
    this.dateModified = (data && data.dateModified) || Date.now();
    
    if (!(this.dateCreated instanceof Date)) {
      this.dateCreated = new Date(this.dateCreated);
    }
    
    if (!(this.dateModified instanceof Date)) {
      this.dateModified = new Date(this.dateModified);
    }
  }

  /**
   * Returns a prettier date. If the date is within the last 24 hours, return
   * the time instead.
   * 
   * @returns {string}
   * 
   * @memberOf Piece
   */
  getPrettyModifiedDate() {
    let aDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.dateModified[ this.dateModified > aDayAgo ? "toLocaleTimeString"
                                                          : "toLocaleDateString" ]();
  }

  /**
   * Return the text content of the piece as HTML.
   * 
   * @returns {string}
   * 
   * @memberOf Piece
   */
  getTextContent() {
    return `<h1>${this.title}</h1><p>${this.content}</p>`;
  }

  /**
   * Return a suitable image. In this case, NULL.
   * 
   * @returns {any}
   * 
   * @memberOf Piece
   */
  getImageContent() {
    return null;
  }

  static make({data, store} = {}) {
    return new Piece({data, store});
  }
}

module.exports = Piece;