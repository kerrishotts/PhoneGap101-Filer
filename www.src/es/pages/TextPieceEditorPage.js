
const $$ = window.Dom7;

const PAGESEL = `.page[data-page="textPieceEditor"]`;

const TextPiece = require("../models/TextPiece.js");
const PieceEditorPage = require("./PieceEditorPage.js");

const _template = Template7.compile(require("../../html/pages/textPieceEditor.html"));

class TextPieceEditorPage extends PieceEditorPage {

    constructor({store, uuid, pageTitle} = {}) {
        super({store, uuid, pageTitle, name: "textPieceEditor", pageSelector: "textPieceEditor", Piece: TextPiece, template: _template});
        this.piece = TextPiece.make({store, data: {uuid}});
    }

    savePiece() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        let content = textarea[0].value;
        if (content !== this.piece.content) {
            this.piece.set("content",textarea[0].value);
            super.savePiece();
        }
    }

    onPieceChanged() {
        super.onPieceChanged();
        // update the editor
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.text(this.piece.content);
    }

    focusTextEditor() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.focus();
    }

    makeDefaultPiece() {
        this.piece.set("title", "Piece Title");
        this.piece.set("content", "Tap to edit text");
    }

    onPageAfterAnimation() {
        super.onPageAfterAnimation();
        this.focusTextEditor();
    }

    static make({store, uuid, pageTitle} = {}) {
        return new TextPieceEditorPage({store, uuid, pageTitle});
    }

}

module.exports = TextPieceEditorPage;
