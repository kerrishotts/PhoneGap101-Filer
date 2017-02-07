
const $$ = window.Dom7;

const PAGESEL = `.page[data-page="imagePieceEditor"]`;

const ImagePiece = require("../models/ImagePiece.js");
const PieceEditorPage = require("./PieceEditorPage.js");

const _template = Template7.compile(require("../../html/pages/imagePieceEditor.html!text"));

class ImagePieceEditorPage extends PieceEditorPage {

    constructor({store, uuid, pageTitle} = {}) {
        super({store, uuid, pageTitle, name: "imagePieceEditor", pageSelector: "imagePieceEditor", Piece: ImagePiece, template: _template});
        this.piece = ImagePiece.make({store, data: {uuid}});
    }

    savePiece() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        let content = textarea[0].value;
        if (content !== this.textPiece.content) {
            this.textPiece.set("content",textarea[0].value);
            super.savePiece();
        }
    }

    onPieceChanged() {
        super.onPieceChanged();
        // update the editor
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.text(this.textPiece.content);
    }

    focusTextEditor() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.focus();
    }

    makeDefaultTextPiece() {
        this.piece.set("title", "Piece Title");
        this.piece.set("content", "Tap to edit this piece");
    }

    onPageAfterAnimation() {
        super.onPageAfterAnimation();
        this.focusTextEditor();
    }

    static make({store, uuid, pageTitle} = {}) {
        return new ImagePieceEditorPage({store, uuid, pageTitle});
    }

}

module.exports = ImagePieceEditorPage;
