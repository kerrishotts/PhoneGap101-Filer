const PIECE = require("../constants/piece.js");
const textPiecePartial = require("../../html/partials/textPiece.html!text");

const compiledPieces = {
    textPiece: Template7.compile(textPiecePartial)
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