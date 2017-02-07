const PIECE = require("../constants/piece.js");
const textPieceTemplate = require("../../html/templates/textPiece.html!text");
const imagePieceTemplate = require("../../html/templates/imagePiece.html!text");

const compiledPieces = {
    textPiece: Template7.compile(textPieceTemplate),
    imagePiece: Template7.compile(imagePieceTemplate)
};

function render_piece() {
    switch (this.type) {
        case PIECE.TEXTPIECETYPE:
            return compiledPieces.textPiece(this);
        case PIECE.IMAGEPIECETYPE:
            return compiledPieces.imagePiece(this);
        default:
            return "No matching template found";
    }
};     

module.exports = render_piece;