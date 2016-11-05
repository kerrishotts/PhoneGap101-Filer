const $$ = window.Dom7;

const STORE = require("../constants/store.js");

const Notes = require("../models/Notes.js");
const Note = require("../models/Note.js");

const _template = Template7.compile(require("../../html/pages/notes.html!text"));
const _listTemplate = Template7.compile(require("../../html/templates/notesListItem.html!text"))

const _store = Symbol("store");

let _compiledTemplate;

class NotesPage {

    constructor({store} = {}) {
        this[_store] = store;
        this.template = _template;
        this.notes = Notes.make({data: {uuid: "notes"}, store});

        this.notes.subscribe("changed", (...args) => this.notesChanged(...args));
        this.notes.subscribe("saved", (...args) => this.notesSaved(...args));
        this.notes.subscribe("loaded", (...args) => this.notesLoaded(...args));

        this.list = null;

    }

    notesChanged() {
        console.log("hi", this);
        if (this.list) {
            this.list.replaceAllItems(this.notes.content);
            this.list.update();
        }

    }

    notesSaved() {
        
    }

    notesLoaded() {
        console.log("loaded?");
    }

    init() {
        $$(document).on("pageInit", `.page[data-page="notes"]`, () => {
            this.list = window.app.virtualList(`.page[data-page="notes"] .list-block`, {
                items: [],
                height: 44 * 2,  // 44 * 4
                template: _listTemplate
            });
            this.notes.load()
            .catch((err) => {
                switch (err.code) {
                    case STORE.CODES.ENTITY_NOT_FOUND:
                        console.log("Setting defaults");
                        this.notes.set("content", [
                            Note.make({data: {title: "Welcome to Filer"}}),
                            Note.make({data: {title: "Notes can have more than one piece"}}),
                            Note.make({data: {title: "Save your memories!"}}),
                            Note.make({data: {title: "Note 4"}}),
                            Note.make({data: {title: "Note 5"}}),
                            Note.make({data: {title: "Note 6"}}),
                            Note.make({data: {title: "Note 7"}}),
                            Note.make({data: {title: "Note 8"}}),
                            Note.make({data: {title: "Note 9"}}),
                            Note.make({data: {title: "Note 10"}}),
                            Note.make({data: {title: "Note 11"}}),
                            Note.make({data: {title: "Note 12"}}),
                            Note.make({data: {title: "Note 13"}}),
                            Note.make({data: {title: "Note 14"}}),
                            Note.make({data: {title: "Note 15"}}),
                            Note.make({data: {title: "Note 16"}})
                        ]);
                        break;
                    default:
                        throw new Error(err);
                }
            });
        });
    }

    static make({store} = {}) {
        return new NotesPage({store});
    }

}

module.exports = NotesPage;
