const TextPieceEditorPage = require("../pages/TextPieceEditorPage.js");
const ImagePieceEditorPage = require("../pages/ImagePieceEditorPage.js");

const PIECE = require("../constants/piece.js");

class PieceEditorPageFactory {
    static make(type, {store, uuid, pageTitle} = {}) {
        switch (type) {
            case PIECE.TEXTPIECETYPE:  return TextPieceEditorPage.make({ store, uuid, pageTitle });
            case PIECE.IMAGEPIECETYPE: return ImagePieceEditorPage.make({ store, uuid, pageTitle });
            default:                   throw new Error (`Don't know how to make editor for type ${type}`)
        }
    }
}

module.exports = PieceEditorPageFactory;