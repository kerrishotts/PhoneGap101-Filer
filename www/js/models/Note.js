const Entity = require("../lib/Entity.js");
const PieceFactory = require("../factories/PieceFactory.js");

class Note extends Entity {
  
  _overlay(data) {
    super._overlay(data);
    this.title =        (data && data.title)        || "";
    this.content =      (data && data.content)      || [];
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
  
  static make({data, store} = {}) {
    return new Note({data, store});
  }
  
}

module.exports = Note;