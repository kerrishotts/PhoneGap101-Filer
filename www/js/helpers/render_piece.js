const PIECE = require("../constants/piece.js");
const textPieceTemplate = require("../../html/templates/textPiece.html!text");

const compiledPieces = {
    textPiece: Template7.compile(textPieceTemplate)
};

function render_piece() {
    switch (this.type) {
        case PIECE.TEXTPIECETYPE:
            return compiledPieces.textPiece(this);
        default:
            return "No matching template found";
    }
};     

module.exports = render_piece;