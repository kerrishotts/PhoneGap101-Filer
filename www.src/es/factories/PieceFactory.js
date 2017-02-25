const Piece = require("../models/Piece.js");
const TextPiece = require("../models/TextPiece.js");
const ImagePiece = require("../models/ImagePiece.js");
const PIECE = require("../constants/piece.js");

class PieceFactory {
    static make(type, {data, store} = {}) {
        switch (type) {
            case PIECE.TEXTPIECETYPE: return TextPiece.make({ data, store });
            case PIECE.IMAGEPIECETYPE: return ImagePiece.make({ data, store });
            case PIECE.PIECETYPE:     return Piece.make({ data, store });
            default:                  throw new Error (`Don't know how to make piece for type ${type}`)
        }
    }
}

module.exports = PieceFactory;