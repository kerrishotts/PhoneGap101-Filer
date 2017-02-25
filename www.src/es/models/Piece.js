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
    this.mediaURI =     (data && data.mediaURI)     || "";
    
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
   * Return a suitable image. In this case, NULL. The return should look like this:
   * 
   * {
   *     type: "icon|image|base64",
   *     image: "icon-name|path-to-file|base64-encoded JPEG"
   * }
   * 
   * @returns {any}
   * 
   * @memberOf Piece
   */
  getImageContent() {
    return null;
  }

  renderImageContent({type, image} = {}) {
    switch (type) {
      case "icon":
        return `<svg viewbox="0 0 32 32"><use xlink:href="#icon-${image}"></use></svg>`;
      case "base64":
        return `<img src="data:image/jpeg;base64,${image}"/>`;
      case "image":
      default:
        return `<img src="${image}"/>`;
    } 
  }

  static make({data, store} = {}) {
    return new Piece({data, store});
  }
}

module.exports = Piece;