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
    return super.load({emit: false}).then( () => {
      return Promise.all(this.content.map((uuid,idx) => {
        let note = Note.make({data: {uuid}, store: this.getStore()});
        return note.load().then(() => {
          this.content[idx] = note;
        });
      }));
    }).then(() => { this.emit("changed") });
  }

  remove() {
    return super.remove().then( () => {
      return Promise.all(this.content.map((item) => item.remove()));
    });
  }

  removeNote(noteOrUUID) {
    let uuid = noteOrUUID;
    if (uuid.uuid) { uuid = uuid.uuid; } 

    let note = this.content.find(item => item.uuid === uuid);
    if (note) {
      this.content = this.content.filter(item => item.uuid !== uuid);
      return note.remove().then(() => this.save());
    } else {
      return Promise.reject();
    }
  }
  static make({data, store} = {}) {
    return new Notes({data, store});
  }

}

module.exports = Notes;