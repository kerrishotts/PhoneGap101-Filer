const $$ = window.Dom7;

const STORE = require("../constants/store.js");

const Note = require("../models/Note.js");
const TextPiece = require("../models/TextPiece.js");

const _template = Template7.compile(require("../../html/pages/note.html!text"));
const _listTemplate = Template7.compile(require("../../html/templates/noteListItem.html!text"))

let _compiledTemplate;

class NotePage {

    constructor({store, uuid, pageTitle} = {}) {
        this.name = "note";
        this.template = _template;
        this.context = {
            pageTitle: pageTitle || "Edit Note",
            rightSVGIcons: ["eyedropper", "bin", "checkmark", "pencil"],
            centerClass: "note-title",
            renderPieces: () => this.note.content.map((piece) => _listTemplate(piece)).join("")
        };

        this.store = store;
        this.note = Note.make({store, data: {uuid}});

    }

    wireEventHandlers() {
        this.note.subscribe("changed", this, this.onNoteChanged);
        this.store.subscribe("savedEntity", this, this.onStoreSavedEntity);
        this.store.subscribe("loadedEntity", this, this.onStoreLoadedEntity);
        this.store.subscribe("removedEntity", this, this.onStoreRemovedEntity);

        this.editTapped = () => {
            $$(`.icon-checkmark`).css("display", "inherit");
            $$(`.icon-bin`).css("display", "inherit");
            $$(`.icon-pencil`).hide();
            $$(`.icon-eyedropper`).hide();
            window.app.sortableToggle(".sortable");
        }
        $$(document).on("click", `.icon-pencil`, this.editTapped); 

        this.checkTapped = () => {
            $$(`.icon-checkmark`).hide();
            $$(`.icon-bin`).hide();
            $$(`.icon-pencil`).css("display", "inherit");
            $$(`.icon-eyedropper`).css("display", "inherit");
            window.app.sortableToggle(".sortable");
        }
        $$(document).on("click", `.icon-checkmark`, this.checkTapped); 

        this.colorTapped = () => {
            window.app.prompt("Enter a Hex or Web color", "Choose color",
            (value) => {
                // OK tapped
                this.note.color = value || "inherit";
                this.note.dateModified = new Date();
                this.note.save();
                this.updateNoteColor();
            },(value) => {
                // CANCEL tapped; do nothing.
            });
        }
        $$(document).on("click", `.icon-eyedropper`, this.colorTapped); 

        this.titleTapped = () => {
            window.app.prompt("Enter your note's title", "Choose title",
            (value) => {
                // OK tapped
                this.note.title = value;
                this.note.dateModified = new Date();
                this.note.save();
                this.updateNoteTitle();
            },(value) => {
                // CANCEL tapped, do nothing.
            });
        }
        $$(document).on("click", `.navbar .center.note-title`, this.titleTapped); 

        // TODO: delete

        // TODO: add item

        this.listSorted = () => {
            let listItems = Array.from($$(`.sortable li a.item-link`));
            this.note.content = listItems.map((a) => {
                let uuid = $$(a).data("uuid");
                for (let piece of this.note.content) {
                    if (piece.uuid === uuid) {
                        return piece;
                    }
                }
            });
            this.note.dateModified = new Date();
            this.note.save();
        }
        $$(document).on("sort", `.sortable li`, this.listSorted);

    }

    unwireEventHandlers() {
        this.note.unsubscribe("changed", this);
        this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);

        $$(document).off("click", `.icon-pencil`, this.editTapped); 
        $$(document).off("click", `.icon-checkmark`, this.checkTapped); 
        $$(document).off("click", `.icon-eyedropper`, this.colorTapped); 
        $$(document).off("click", `.navbar .center.note-title`, this.titleTapped); 
        $$(document).off("sort", `.sortable li`, this.listSorted);
    }

    destroy() {
        this.unwireEventHandlers();
    }

    updateNoteColor() {
        $$(`.page[data-page=note] .page-content`).css("color", this.note.color);
    }

    updateNoteTitle() {
        $$(`.navbar .center.note-title`).text(this.note.title);
    }

    onNoteChanged() {
        this.updateNoteColor();
        $$(`.page[data-page=note] .list-block.sortable ul`).html(this.context.renderPieces());
    }

    onStoreSavedEntity() {
    }

    onStoreRemovedEntity() {
    }

    onStoreLoadedEntity(...args) {
    }

    makeDefaultNote() {
        let store = this.store;
        this.note.set("title", "Note Title");
        this.note.set("content", [
            TextPiece.make({store, data: {title: "Tap to edit this piece"}})
        ]);
    }

    onPageInit() {
        this.wireEventHandlers();

        // hide some of our icons that we don't initially want visible
        $$(`.icon-checkmark`).hide();
        $$(`.icon-bin`).hide();

        this.note.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    this.makeDefaultNote();
                    break;
                default:
                    throw new Error(err);
            }
        });
    }

    static make({store, uuid, pageTitle} = {}) {
        return new NotePage({store, uuid, pageTitle});
    }

}

module.exports = NotePage;
