const Piece = require("./Piece.js");
const PIECE = require("../constants/piece.js");

class TextPiece extends Piece {
  _overlay(data) {
    super._overlay(data);
    this.type = (data && data.type) || PIECE.TEXTPIECETYPE;
  }
 
  static make({data, store} = {}) {
    return new TextPiece({data, store});
  }
}

module.exports = TextPiece;