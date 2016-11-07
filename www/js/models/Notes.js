const Entity = require("../lib/Entity.js");
const Note = require("./Note.js");

class Notes extends Entity {
  
  _overlay(data) {
    super._overlay(data);
    this.content = (data && data.content) || [];
  }

  _preSerialize(entity) {
    entity.content = entity.content.map(item => item.uuid);
  }

  save() {
    return Promise.all(this.content.map(note => note.save()))
           .then(() => super.save());
  }
  
  load() {
    return super.load().then( () => {
      return Promise.all(this.content.map((uuid,idx) => {
        let note = Note.make({data: {uuid}, store: this.getStore()});
        return note.load().then(() => {
          this.content[idx] = note;
        });
      }));
    });
  }

  static make({data, store} = {}) {
    return new Notes({data, store});
  }

}

module.exports = Notes;