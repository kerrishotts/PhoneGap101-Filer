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
    
    if (!(this.dateCreated instanceof Date)) {
      this.dateCreated = new Date(this.dateCreated);
    }
    
    if (!(this.dateModified instanceof Date)) {
      this.dateModified = new Date(this.dateModified);
    }
  }
  
  _preSerialize(entity) {
    entity.content = entity.content.map(item => ({"uuid": item.uuid, "type": item.type}));
  }
  
  save() {
    return Promise.all(this.content.map(item => item.save()))
           .then(() => super.save());
  }
  
  load() {
    return super.load().then( () => {
      return Promise.all(this.content.map((item,idx) => {
        // contents will be an array of UUIDS and types -- we need to load
        // each entity
        let piece = PieceFactory.make(item.type, {data: item, store: this.getStore()});
        return piece.load().then(() => {
          this.content[idx] = piece;
        });
      }));
    });
  }

  getPrettyModifiedDate() {
    let aDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.dateModified[ this.dateModified > aDayAgo ? "toLocaleTimeString"
                                                          : "toLocaleDateString" ]();
  }

  getTextContent() {
    return this.content.map(piece => piece.getTextContent()).join("<br/>");
  }

  getThumbnailImage() {
    let firstImage = this.content.map(piece => piece.getImageContent())[0];
    if (!firstImage) {
      return `<svg viewbox="0 0 32 32"><use xlink:href="#icon-file-text2"></use></svg>`;
    } else {
      return `<img src="${firstImage}"/>`;
    }
  }
  
  
  static make({data, store} = {}) {
    return new Note({data, store});
  }
  
  static makeWithPieces({data, pieces = [], store} = {}) {
    let note = new Note({data, store});
    note.content = pieces;
    return note;
  }
}

module.exports = Note;