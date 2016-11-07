const $$ = window.Dom7;

const STORE = require("../constants/store.js");

const Notes = require("../models/Notes.js");
const Note = require("../models/Note.js");
const TextPiece = require("../models/TextPiece.js");

const _template = Template7.compile(require("../../html/pages/notes.html!text"));
const _listTemplate = Template7.compile(require("../../html/templates/notesListItem.html!text"))

const NotePage = require("./NotePage.js");

let _compiledTemplate;

class NotesPage {

    constructor({store} = {}) {
        this.name = "notes";
        this.template = _template;
        this.context = {
            pageTitle: "Filer",
            rightSVGIcons: ["info"]
        }

        this.store = store;
        this.notes = Notes.make({data: {uuid: "notes"}, store});

        this.list = null;
    }

    wireEventHandlers() {
        this.notes.subscribe("changed", this, this.onNotesChanged);
        this.store.subscribe("savedEntity", this, this.onStoreSavedEntity);
        this.store.subscribe("loadedEntity", this, this.onStoreLoadedEntity);
        this.store.subscribe("removedEntity", this, this.onStoreRemovedEntity);

        // TODO: delete

        // TODO: add new note

        this.noteTapped = (e) => {
            let listItem = $$($$(e.target).closest(".item-link"));
            let uuid = listItem.data("uuid");
            let pageTitle = listItem.data("title");
            let notePage = NotePage.make({store: this.store, uuid, pageTitle});
            window.app.go(notePage);
        }
        $$(document).on("click", `.page[data-page="notes"] .item-link`, this.noteTapped); 
    }

    unwireEventHandlers() {
        this.notes.unsubscribe("changed", this);
        this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);
        $$(document).off("click", `.page[data-page="notes"] .item-link`, this.noteTapped); 
    }

    destroy() {
        this.unwireEventHandlers();
    }

    onNotesChanged() {
        if (this.list) {
            this.list.replaceAllItems(this.notes.content);
        }
    }

    onStoreSavedEntity(sender, event, uuid) {
        let modifiedNote = this.notes.content.find(note => note.uuid === uuid);
        if (modifiedNote) {
            modifiedNote.load().then(() => {
                Array.from($$(`.page[data-page=notes] li a.item-link`)).forEach(
                    (a, idx) => {
                        if ($$(a).data("uuid") === uuid) {
                            this.list.replaceItem(idx, modifiedNote);
                        }
                    }
                )
            });
        }
    }

    onStoreRemovedEntity() {

    }

    onStoreLoadedEntity(...args) {
    }


    makeDefaultNotes() {
        let store = this.store;
        console.log("making default notes...");
        this.notes.set("content", [
            Note.makeWithPieces(
                {store, 
                 data: {title: "Welcome to Filer"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "What's This?",
                             content: `You can use this app to store important notes that you need 
                                       to remember`}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "About pieces"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "Notes are made of pieces",
                             content: `You can have as many pieces as you need.`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "This is the second piece",
                             content: `Want more? Just tap the Add icon.`}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "Be colorful!", color: "#4080C0"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "Use the rainbow",
                             content: `Notes and individual pieces can be any color you like!`}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "Read this!", color: "#800000"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "Color can also indicate importance",
                             content: `But you are free to interpret color as you wish.`}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "Example: Vacation"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "Dates",
                             content: `2017/07/04 - 2017/07/15`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "Location",
                             content: `Amsterdam?`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "Hotel",
                             content: `Hotel Estherea; confirmation #12345678`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "Flight",
                             content: `Delta; confirmation #ABCDEFGH; seat 18A`}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "Example: Gift Ideas"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "For Mom",
                             content: `- Coffee maker <br/> - Tablet <br/> - Soft blanket`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "For Dad",
                             content: `- Foot stool <br/> - Huge TV <br/> - Carving tools`}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "For Brother",
                             content: `- Football poster<br/> - Lord of the Rings trilogy`}}),
                        ]}),
        ]);
    }

    onPageInit() {

        this.wireEventHandlers();
        this.list = window.app.virtualList(`.page[data-page="notes"] .list-block`, {
            items: [],
            height: 44 * 2,  // 44 * 4
            template: _listTemplate
        });
        this.notes.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    this.makeDefaultNotes();
                    return this.notes.save();
                    break;
                default:
                    throw new Error(err);
            }
        });

    }


    static make({store} = {}) {
        return new NotesPage({store});
    }

}

module.exports = NotesPage;
