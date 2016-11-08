
const $$ = window.Dom7;

const STORE = require("../constants/store.js");
const PAGESEL = `.page[data-page="textPieceEditor"]`;

const TextPiece = require("../models/TextPiece.js");

const _template = Template7.compile(require("../../html/pages/textPieceEditor.html!text"));

let _compiledTemplate;

class TextPieceEditorPage {

    constructor({store, uuid, pageTitle} = {}) {
        this.name = "textPieceEditor";
        this.template = _template;
        this.context = {
            name: this.name,
            pageTitle: pageTitle || "Title",
            rightSVGIcons: ["eyedropper", "bin"],
            centerClass: "piece-title"
        };

        this.store = store;
        this.textPiece = TextPiece.make({store, data: {uuid}});
    }

    wireEventHandlers() {
        this.textPiece.subscribe("changed", this, this.onTextPieceChanged);
        this.store.subscribe("savedEntity", this, this.onStoreSavedEntity);
        this.store.subscribe("loadedEntity", this, this.onStoreLoadedEntity);
        this.store.subscribe("removedEntity", this, this.onStoreRemovedEntity);

        this.savePieceOnPause = () => {
            this.savePiece();
        }
        document.addEventListener("pause", this.savePieceOnPause, false);

        this.colorTapped = () => {
            window.app.prompt("Enter a Hex or Web color", "Choose color",
            (value) => {
                // OK tapped
                this.textPiece.color = value || "inherit";
                this.textPiece.dateModified = new Date();
                this.textPiece.save();
                this.updateTextPieceColor();
            },(value) => {
                // CANCEL tapped; do nothing.
            });
        }
        $$(document).on("click", `.icon-eyedropper.page-textPieceEditor`, this.colorTapped); 

        this.deleteTapped = () => {
            window.app.modal({
                title: "Really delete?",
                text: "This action cannot be undone",
                buttons: [
                    {text: "Cancel"},
                    {text: "Delete", bold: true,
                     onClick: () => {
                         this.textPiece.remove()
                         .then( () => window.app.goBack());
                         //.then( () => setTimeout(window.app.goBack,100));
                     }}
                ]
            });
        }
        $$(document).on("click", `.icon-bin.page-textPieceEditor`, this.deleteTapped); 

        this.titleTapped = () => {
            window.app.prompt("Enter your piece title", "Choose title",
            (value) => {
                // OK tapped
                this.textPiece.title = value;
                this.textPiece.dateModified = new Date();
                this.textPiece.save();
                this.updateTextPieceTitle();
            },(value) => {
                // CANCEL tapped, do nothing.
            });
        }
        $$(document).on("click", `.navbar .center.piece-title`, this.titleTapped); 

        // TODO: delete
    }

    unwireEventHandlers() {
        this.textPiece.unsubscribe("changed", this);
        this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);

        document.removeEventListener("pause", this.savePieceOnPause, false);

        $$(document).off("click", `.icon-eyedropper.page-textPieceEditor`, this.colorTapped); 
        $$(document).off("click", `.icon-bin.page-textPieceEditor`, this.deleteTapped);
        $$(document).off("click", `.navbar .center.piece-title`, this.titleTapped); 
    }

    init() {
        this.wireEventHandlers();
    }

    destroy() {
        this.unwireEventHandlers();
    }

    savePiece() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        let content = textarea[0].value;
        if (content !== this.textPiece.content) {
            this.textPiece.dateModified = new Date();
            this.textPiece.set("content",textarea[0].value);
            this.textPiece.save();
        }
    }

    updateTextPieceColor() {
        $$(`${PAGESEL} .page-content`).css("color", this.textPiece.color);
        if (Template7.global.android) {
            $$(`.navbar-inner.page-textPieceEditor`).css("background-color", this.textPiece.color); 
        } else {
            $$(`.navbar .center.piece-title`).css("color", this.textPiece.color); 
        }
    }

    updateTextPieceTitle() {
        $$(`.navbar .center.piece-title`).text(this.textPiece.title);
    }

    onTextPieceChanged() {
        this.updateTextPieceColor();
        // update the editor
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.text(this.textPiece.content);
        window.app.resizeTextarea(textarea);
    }

    focusTextEditor() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.focus();
    }

    onStoreSavedEntity() {
    }

    onStoreRemovedEntity() {
    }

    onStoreLoadedEntity(...args) {
    }

    makeDefaultTextPiece() {
        let store = this.store;
        this.textPiece.set("title", "Piece Title");
        this.textPiece.set("content", "Tap to edit this piece");
    }

    onPageInit() {

        this.textPiece.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    this.makeDefaultTextPiece();
                    break;
                default:
                    throw new Error(err);
            }
        });
    }

    onPageAfterAnimation() {
        this.focusTextEditor();
    }

    onPageBack() {
        this.savePiece();
    }

    static make({store, uuid, pageTitle} = {}) {
        return new TextPieceEditorPage({store, uuid, pageTitle});
    }

}

module.exports = TextPieceEditorPage;
