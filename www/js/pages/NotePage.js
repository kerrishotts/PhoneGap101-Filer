const $$ = window.Dom7;

const STORE = require("../constants/store.js");
const PIECE = require("../constants/piece.js");

const PAGESEL = `.page[data-page="note"]`;

const Note = require("../models/Note.js");

const PieceFactory = require("../factories/PieceFactory.js");
const PieceEditorPageFactory = require("../factories/PieceEditorPageFactory.js");

const _template = Template7.compile(require("../../html/pages/note.html!text"));
const _listTemplate = Template7.compile(require("../../html/templates/noteListItem.html!text"))

class NotePage {

    constructor({store, uuid, pageTitle} = {}) {
        this.name = "note";
        this.template = _template;
        this.context = {
            name: this.name,
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
            window.app.sortableOpen(`${PAGESEL} .sortable`);
        }
        $$(document).on("click", `.icon-pencil.page-note`, this.editTapped); 

        this.checkTapped = () => {
            $$(`.icon-checkmark`).hide();
            $$(`.icon-bin`).hide();
            $$(`.icon-pencil`).css("display", "inherit");
            $$(`.icon-eyedropper`).css("display", "inherit");
            window.app.sortableClose(`${PAGESEL} .sortable`);
        }
        $$(document).on("click", `.icon-checkmark.page-note`, this.checkTapped); 

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
        $$(document).on("click", `.icon-eyedropper.page-note`, this.colorTapped); 

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

        this.pieceTapped = (e) => {
            let listItem = $$($$(e.target).closest(".item-link"));
            let uuid = listItem.data("uuid");
            let pageTitle = listItem.data("title");
            let itemType = listItem.data("type");
            let piecePage = PieceEditorPageFactory.make(itemType,{store:this.store, uuid, pageTitle});
            window.app.go(piecePage);
        }
        $$(document).on("click", `${PAGESEL} .item-link`, this.pieceTapped); 

        this.pieceDeleted = (e) => {
            let listItem = $$($$(e.target).parent().prev().children("a")[0]);
            let uuid = listItem.data("uuid");
            setTimeout(() => this.note.removePiece(uuid), 350);
        }
        $$(document).on("click", `${PAGESEL} .swipeout-delete`, this.pieceDeleted);

        this.deleteTapped = () => {
            window.app.modal({
                title: "Really delete?",
                text: "This action cannot be undone",
                buttons: [
                    {text: "Cancel"},
                    {text: "Delete", bold: true,
                     onClick: () => {
                         this.note.remove()
                         .then( () => window.app.goBack());
                     }}
                ]
            });
        }
        $$(document).on("click", `.icon-bin.page-note`, this.deleteTapped); 

        this.addPiece = (PIECETYPE, data) => {
            let piece = PieceFactory.make(PIECETYPE, {store: this.store, data});
            this.note.content.push(piece);
            this.note.save().then( () => {
                let piecePage = PieceEditorPageFactory.make(PIECETYPE,{store:this.store, uuid: piece.uuid, pageTitle: piece.title});
                window.app.go(piecePage);
            });
        }
        this.addTextPiece = () => {
            this.addPiece(PIECE.TEXTPIECETYPE, {title: "Tap to edit", content: "Tap to edit"});
        }
        this.addImagePiece = () => {
            this.addPiece(PIECE.IMAGEPIECETYPE, {title: "Edit caption", content: "Take a picture"});
        }
        $$(document).on("click", `${PAGESEL} a.add-text-piece`, this.addTextPiece);
        $$(document).on("click", `${PAGESEL} a.add-image-piece`, this.addImagePiece);

        this.listSorted = () => {
            if (window.app.DEBUG) { console.log ("sorting note pieces..."); }

            let listItems = Array.from($$(`${PAGESEL} .sortable li a.item-link`));
            this.note.content = listItems.map((a) => 
                this.note.content.find(item => 
                    item.uuid === $$(a).data("uuid")));
            this.note.dateModified = new Date();
            this.note.save();
        }
        $$(document).on("sort", `${PAGESEL} .sortable li`, this.listSorted);

    }

    unwireEventHandlers() {
        this.note.unsubscribe("changed", this);
        this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);

        $$(document).off("click", `.icon-pencil.page-note`, this.editTapped); 
        $$(document).off("click", `.icon-checkmark.page-note`, this.checkTapped); 
        $$(document).off("click", `.icon-eyedropper.page-note`, this.colorTapped); 
        $$(document).off("click", `.navbar .center.note-title`, this.titleTapped); 
        $$(document).off("click", `.icon-bin.page-note`, this.deleteTapped); 
        $$(document).off("sort", `${PAGESEL} .sortable li`, this.listSorted);
        $$(document).off("click", `${PAGESEL} .item-link`, this.pieceTapped); 
        $$(document).off("click", `${PAGESEL} .swipeout-delete`, this.pieceDeleted);
        $$(document).off("click", `${PAGESEL} a.add-text-piece`, this.addTextPiece);
        $$(document).off("click", `${PAGESEL} a.add-image-piece`, this.addImagePiece);
    }

    init() {
        this.wireEventHandlers();
    }
    destroy() {
        this.unwireEventHandlers();
    }

    updateNoteColor() {
        $$(`${PAGESEL} .page-content`).css("color", this.note.color);
        if (Template7.global.android) {
            $$(`.navbar-inner.page-note`).css("background-color", this.note.color); 
        } else {
            $$(`.navbar .center.note-title`).css("color", this.note.color); 
        }
    }

    updateNoteTitle() {
        $$(`.navbar .center.note-title`).text(this.note.title);
    }

    onNoteChanged() {
        this.updateNoteColor();
        $$(`${PAGESEL} .list-block.sortable ul`).html(this.context.renderPieces());
    }

    onStoreSavedEntity(sender, event, uuid) {
        let modifiedPiece = this.note.content.find(item => item.uuid === uuid);
        if (modifiedPiece) {
            modifiedPiece.load().then(() => {
                this.onNoteChanged();
            });
        }
    }

    onStoreRemovedEntity(sender, event, uuid) {
        this.note.removePiece(uuid)
            .then(() => this.onNoteChanged)
            .catch(() => {});
    }

    onStoreLoadedEntity(...args) {
    }

    makeDefaultNote() {
        let store = this.store;
        this.note.set("title", "Note Title");
        this.note.set("content", [
            PieceFactory.make(PIECE.TEXTPIECETYPE, {store, data: {title: "Tap to edit this piece"}})
        ]);
    }

    onPageInit() {

        // hide some of our icons that we don't initially want visible
        $$(`.icon-checkmark`).hide();
        $$(`.icon-bin`).hide();

        $$(`.icon-eyedropper`).css("display", "inherit");
        $$(`.icon-pencil`).css("display", "inherit");

        this.note.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    if (err.data === this.note.uuid) {
                        this.makeDefaultNote();
                        break;
                    }
                default:
                    throw new Error(err);
            }
        });
    }

    onPageAfterAnimation() {
        window.app.sortableClose(`${PAGESEL} .sortable`);
    }

    static make({store, uuid, pageTitle} = {}) {
        return new NotePage({store, uuid, pageTitle});
    }

}

module.exports = NotePage;
