const Entity = require("../lib/Entity.js");
const PieceFactory = require("../factories/PieceFactory.js");

class Note extends Entity {
  
  _overlay(data) {
    super._overlay(data);
    this.title =        (data && data.title)        || "";
    this.content =      (data && data.content)      || [];
    this.color =        (data && data.color)        || "inherit";
    this.dateCreated =  (data && data.dateCreated)  || Date.now();
    this.dateModified = (data && data.dateModified) || Date.now();

    // dates have a habit of becoming strings or numbers when deserialized, so
    // convert them back if needed.    
    if (!(this.dateCreated instanceof Date)) {
      this.dateCreated = new Date(this.dateCreated);
    }
    
    if (!(this.dateModified instanceof Date)) {
      this.dateModified = new Date(this.dateModified);
    }
  }
  
  _preSerialize(entity) {
    // before serialization, make sure the entity's content array contains only
    // uuids and types.
    entity.content = entity.content.map(item => ({"uuid": item.uuid, "type": item.type}));
  }
  
  save() {
    // save all pieces, then save ourselves.
    return Promise.all(this.content.map(item => item.save()))
           .then(() => super.save());
  }
  
  load() {
    // load ourself first (preventing event emission), then load each piece.
    return super.load({emit: false}).then( () => {
      return Promise.all(this.content.map((item,idx) => {
        // contents will be an array of UUIDS and types -- we need to load
        // each entity
        let piece = PieceFactory.make(item.type, {data: item, store: this.getStore()});
        return piece.load().then(() => {
          this.content[idx] = piece;
        });
      }));
    }).then(() => { this.emit("changed") });
  }

  remove() {
    // remove ourself and then also remove all our pieces
    return super.remove().then( () => {
      return Promise.all(this.content.map((item) => item.remove()))
      .then( () => { this.content=[]; } );
    });
  }

  /**
   * Remove a piece from this note
   * 
   * @param {string|Object} pieceOrUUID
   * @returns
   * 
   * @memberOf Note
   */
  removePiece(pieceOrUUID) {
    let uuid = pieceOrUUID;
    if (uuid.uuid) { uuid = uuid.uuid; } 

    let piece = this.content.find(item => item.uuid === uuid);
    if (piece) {
      this.content = this.content.filter(item => item.uuid !== uuid);
      return piece.remove().then(() => this.save());
    } else {
      return Promise.reject();
    }
  }

  /**
   * Returns a prettier date -- if the date is within the last 24 hours, use the
   * time, otherwise use the date.
   * 
   * @returns {string}
   * 
   * @memberOf Note
   */
  getPrettyModifiedDate() {
    let aDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.dateModified[ this.dateModified > aDayAgo ? "toLocaleTimeString"
                                                          : "toLocaleDateString" ]();
  }

  /**
   * Returns text content from all pieces, joined with HTML breaks
   * 
   * @returns {string}
   * 
   * @memberOf Note
   */
  getTextContent() {
    return this.content.map(piece => piece.getTextContent()).join("<br/>");
  }

  /**
   * Returns a suitable thumbnail for the note.
   * 
   * @returns {string}
   * 
   * @memberOf Note
   */
  getThumbnailImage() {
    let firstImage = this.content.reduce((ret, piece) => {
      if (ret) {
        return ret;
      }
      return piece.getImageContent() ? piece.getImageContent() : ret;
    }, null);
    if (!firstImage) {
      return `<svg viewbox="0 0 32 32"><use xlink:href="#icon-file-text2"></use></svg>`;
    } else {
      return firstImage;
    }
  }
  
  static make({data, store} = {}) {
    return new Note({data, store});
  }

  /**
   * Utility method for creating a note rapidly. The note will be created and the
   * pieces assigned to the note.
   * 
   * @static
   * @param {any} [{data, pieces = [], store}={}]
   * @returns
   * 
   * @memberOf Note
   */  
  static makeWithPieces({data, pieces = [], store} = {}) {
    let note = new Note({data, store});
    note.content = pieces;
    return note;
  }
}

module.exports = Note;