
const $$ = window.Dom7;

const STORE = require("../constants/store.js");

class PieceEditorPage {

    constructor({store, uuid, pageTitle, name, pageSelector, Piece, template} = {}) {
        this.name = name;
        this.pageSelector = pageSelector;
        this._PAGESEL = `.page[data-page="${pageSelector}"]`;
        this.template = template;
        this.context = {
            name: this.name,
            pageTitle: pageTitle || "Title",
            rightSVGIcons: ["eyedropper", "bin"],
            centerClass: "piece-title"
        };

        this.store = store;
        this.piece = Piece.make({store, data: {uuid}});
    }

    wireEventHandlers() {
        this.piece.subscribe("changed", this, this.onPieceChanged);
        /*this.store.subscribe("savedEntity", this, this.onStoreSavedEntity);
        this.store.subscribe("loadedEntity", this, this.onStoreLoadedEntity);
        this.store.subscribe("removedEntity", this, this.onStoreRemovedEntity);*/

        this.savePieceOnPause = () => {
            this.savePiece();
        }
        document.addEventListener("pause", this.savePieceOnPause, false);

        this.colorTapped = () => {
            window.app.prompt("Enter a Hex or Web color", "Choose color",
            (value) => {
                // OK tapped
                this.piece.color = value || "inherit";
                this.piece.dateModified = new Date();
                this.piece.save();
                this.updatePieceColor();
            },(value) => {
                // CANCEL tapped; do nothing.
            });
        }
        $$(document).on("click", `.icon-eyedropper.page-${this.pageSelector}`, this.colorTapped); 

        this.deleteTapped = () => {
            window.app.modal({
                title: "Really delete?",
                text: "This action cannot be undone",
                buttons: [
                    {text: "Cancel"},
                    {text: "Delete", bold: true,
                     onClick: () => {
                         this.piece.remove()
                         .then( () => window.app.goBack());
                     }}
                ]
            });
        }
        $$(document).on("click", `.icon-bin.page-${this.pageSelector}`, this.deleteTapped); 

        this.titleTapped = () => {
            window.app.prompt("Enter your piece title", "Choose title",
            (value) => {
                // OK tapped
                this.piece.title = value;
                this.piece.dateModified = new Date();
                this.piece.save();
                this.updatePieceTitle();
            },(value) => {
                // CANCEL tapped, do nothing.
            });
        }
        $$(document).on("click", `.navbar .center.piece-title`, this.titleTapped); 
    }

    unwireEventHandlers() {
        this.piece.unsubscribe("changed", this);
        /*this.store.unsubscribe("savedEntity", this);
        this.store.unsubscribe("loadedEntity", this);
        this.store.unsubscribe("removedEntity", this);*/

        document.removeEventListener("pause", this.savePieceOnPause, false);

        $$(document).off("click", `.icon-eyedropper.page-${this.pageSelector}`, this.colorTapped); 
        $$(document).off("click", `.icon-bin.page-${this.pageSelector}`, this.deleteTapped);
        $$(document).off("click", `.navbar .center.piece-title`, this.titleTapped); 
    }

    init() {
        this.wireEventHandlers();
    }

    destroy() {
        this.unwireEventHandlers();
    }

    savePiece() {
        this.piece.dateModified = new Date();
        this.piece.save();
    }

    updatePieceColor() {
        $$(`${this.PAGESEL} .page-content`).css("color", this.piece.color);
        if (Template7.global.android) {
            $$(`.navbar-inner.page-${this.pageSelector}`).css("background-color", this.piece.color); 
        } else {
            $$(`.navbar .center.piece-title`).css("color", this.piece.color); 
        }
    }

    updatePieceTitle() {
        $$(`.navbar .center.piece-title`).text(this.piece.title);
    }

    onPieceChanged() {
        this.updatePieceColor();
    }

    makeDefaultPiece() {
        this.piece.set("title", "Piece Title");
    }

    onPageInit() {
        this.piece.load()
        .catch((err) => {
            switch (err.code) {
                case STORE.CODES.ENTITY_NOT_FOUND:
                    this.makeDefaultPiece();
                    break;
                default:
                    throw new Error(err);
            }
        });
    }

    onPageAfterAnimation() {
    }

    onPageBack() {
        this.savePiece();
    }

    static make({store, uuid, pageTitle, name, pageSelector, Piece, template} = {}) {
        return new PieceEditorPage({store, uuid, pageTitle, name, pageSelector, Piece, template});
    }

}

module.exports = PieceEditorPage;
