const $$ = window.Dom7;

const PAGESEL = `.page[data-page="notes"]`;

const STORE = require("../constants/store.js");

const Notes = require("../models/Notes.js");
const Note = require("../models/Note.js");
const TextPiece = require("../models/TextPiece.js");

const _template = Template7.compile(require("../../html/pages/notes.html!text"));
const _listTemplate = Template7.compile(require("../../html/templates/notesListItem.html!text"))

const NotePage = require("./NotePage.js");
const AboutPage = require("./AboutPage.js");

let _compiledTemplate;

function trimWhitespace(str) {
    return str.replace(/   /g,"").replace(/  /g,"");
}

class NotesPage {

    constructor({store} = {}) {
        this.name = "notes";
        this.template = _template;
        this.context = {
            name: this.name,
            pageTitle: "Filer",
            leftSVGIcons: Template7.global.android ? [] : ["info"],
            rightSVGIcons: Template7.global.android ? ["pencil", "checkmark", "info"] : ["pencil", "checkmark", "plus"]
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

        this.noteDeleted = (e) => {
            let listItem = $$($$(e.target).parent().prev().children("a")[0]);
            let uuid = listItem.data("uuid");
            setTimeout(() => this.notes.removeNote(uuid), 350);
        }
        $$(document).on("click", `${PAGESEL} .swipeout-delete`, this.noteDeleted);

        this.noteTapped = (e) => {
            let listItem = $$($$(e.target).closest(".item-link"));
            let uuid = listItem.data("uuid");
            let pageTitle = listItem.data("title");
            let notePage = NotePage.make({store: this.store, uuid, pageTitle});
            window.app.go(notePage);
        }
        $$(document).on("click", `${PAGESEL} .item-link`, this.noteTapped); 

        this.addNote = () => {
            let note = Note.makeWithPieces(
                {store: this.store, 
                 data: {title: "New Note"},
                        pieces: [TextPiece.make(
                            {store: this.store, 
                             data: {title: "Tap to edit",
                             content: `Tap to edit`}}),
                        ]});
            this.notes.content.push(note);
            this.notes.save().then( () => {
                let notePage = NotePage.make({store: this.store, uuid:note.uuid, pageTitle:note.title});
                window.app.go(notePage);
            });
        }
        $$(document).on("click", `.icon-plus.page-notes`, this.addNote);
        $$(document).on("click", `${PAGESEL} .floating-button`, this.addNote);

        this.infoTapped = () => {
            let aboutPage = AboutPage.make();
            window.app.go(aboutPage);
        }
        $$(document).on("click", `.icon-info.page-notes`, this.infoTapped);

        this.editTapped = () => {
            $$(`.icon-checkmark`).css("display", "inherit");
            $$(`.icon-pencil`).hide();
            window.app.sortableOpen(`${PAGESEL} .sortable`);
        }
        $$(document).on("click", `.icon-pencil.page-notes`, this.editTapped); 

        this.checkTapped = () => {
            $$(`.icon-checkmark`).hide();
            $$(`.icon-pencil`).css("display", "inherit");
            window.app.sortableClose(`${PAGESEL} .sortable`);
        }
        $$(document).on("click", `.icon-checkmark.page-notes`, this.checkTapped); 

        this.listSorted = (e) => {
            if (window.app.DEBUG) { console.log ("sorting notes..."); }

            let listItems = Array.from($$(`${PAGESEL} .sortable li.swipeout a.item-link`));
            this.notes.content = this.notes.content.map((note, idx) => {
                if (idx < this.list.currentFromIndex || idx > this.list.currentToIndex) {
                    // if the index is outside the visible elements, return the item unchanged
                    return note;
                } else {
                    // otherwise, return the item matching the UUID present in the DOM
                    return this.notes.content.find(item => item.uuid === $$(listItems[idx - this.list.currentFromIndex]).data("uuid"));
                }
            });

            // tell the virtual list the new order
            this.list.items.forEach((item,idx) => {
                if (item.uuid !== this.notes.content[idx].uuid) {
                    this.list.replaceItem(idx, this.notes.content[idx]);
                }
            });
            // wait to save until any animations have completed
            setTimeout(()=> this.notes.save(), 350);
        }
        $$(document).on("sort", `${PAGESEL} .sortable li`, this.listSorted);

    }

    unwireEventHandlers() {
        this.notes.unsubscribe("changed", this);
        this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);
        $$(document).off("click", `${PAGESEL} .item-link`, this.noteTapped); 
        $$(document).off("click", `${PAGESEL} .swipeout-delete`, this.noteDeleted);
        $$(document).off("click", `.icon-plus.page-notes`, this.addNote);
        $$(document).off("click", `${PAGESEL} .floating-button`, this.addNote);
        $$(document).off("click", `.icon-info.page-notes`, this.infoTapped);
        $$(document).off("click", `.icon-pencil.page-notes`, this.editTapped); 
        $$(document).off("click", `.icon-checkmark.page-notes`, this.checkTapped); 
        $$(document).off("sort", `${PAGESEL} .sortable li`, this.listSorted);
    }

    init() {
        this.wireEventHandlers();
    }
    destroy() {
        this.unwireEventHandlers();
    }

    onNotesChanged() {
        if (this.list) {
            this.list.replaceAllItems(this.notes.content.map(note => note));
        }
    }

    onStoreSavedEntity(sender, event, uuid) {
        let modifiedNote = this.notes.content.find(note => note.uuid === uuid);
        let replaced = false;
        if (modifiedNote) {
            modifiedNote.load().then(() => {
                this.list.items.forEach((item, idx) => {
                    if (item.uuid === uuid) {
                        this.list.replaceItem(idx, modifiedNote);
                        replaced = true;
                    }});
                if (!replaced) {
                    this.list.appendItem(modifiedNote);
                }
            });
        }
    }

    onStoreRemovedEntity(sender, event, uuid) {
        let removedNoteIdx = this.notes.content.findIndex(note => note.uuid === uuid);
        if (removedNoteIdx > -1) {
            if (this.list) {
                this.list.deleteItem(removedNoteIdx);
            }
            this.notes.removeNote(uuid)
                .catch(() => {});
        }
    }

    onStoreLoadedEntity(...args) {
    }


    makeDefaultNotes() {
        let store = this.store;
        if (window.app.DEBUG) { console.log("making default notes..."); }
        this.notes.set("content", [
            Note.makeWithPieces(
                {store, 
                 data: {title: "Welcome to Filer"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "What's This?",
                             content: trimWhitespace(`You can use this app to store important notes that you need 
                                       to remember.`)}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "About pieces"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "Pieces",
                             content: trimWhitespace(`Notes are made of pieces.
                                       You can have as many pieces as you need.`)}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "Second piece",
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
                             data: {title: "More color",
                             content: `Color could indicate importance, but you are free to interpret color as you wish.`}}),
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
                             content: trimWhitespace(`Hotel Estherea
                                       Confirmation #12345678`)}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "Flight",
                             content: trimWhitespace(`Delta Flight #201
                                       Confirmation #ABCDEFGH
                                       Seat 18A`)}}),
                        ]}),
            Note.makeWithPieces(
                {store, 
                 data: {title: "Example: Gift Ideas"},
                        pieces: [TextPiece.make(
                            {store, 
                             data: {title: "For Mom",
                             content: trimWhitespace(`- Coffee maker
                                       - Tablet
                                       - Soft blanket`)}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "For Dad",
                             content: trimWhitespace(`- Foot stool 
                                       - Huge TV 
                                       - Carving tools`)}}),
                        TextPiece.make(
                            {store, 
                             data: {title: "For Brother",
                             content: trimWhitespace(`- Football poster 
                                       - Lord of the Rings trilogy`)}}),
                        ]}),
        ]);
    }

    onPageInit() {

        $$(`.icon-checkmark`).hide();
        $$(`.icon-pencil`).css("display", "inherit");

        this.list = window.app.virtualList(`${PAGESEL} .list-block`, {
            items: [],
            height: 44 * 2,  // 44 * 4
            template: _listTemplate
        });
        this.notes.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    if (err.data === "notes") {
                        this.makeDefaultNotes();
                        return this.notes.save();
                    }
                default:
                    throw new Error(err);
            }
        });

    }

    onPageAfterAnimation() {
        window.app.sortableClose(`${PAGESEL} .sortable`);
    }

    static make({store} = {}) {
        return new NotesPage({store});
    }

}

module.exports = NotesPage;
