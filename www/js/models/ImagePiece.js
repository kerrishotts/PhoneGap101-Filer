const Piece = require("./Piece.js");
const PIECE = require("../constants/piece.js");

class ImagePiece extends Piece {
  _overlay(data) {
    super._overlay(data);
    this.type = (data && data.type) || PIECE.IMAGEPIECETYPE;
  }

  getImageContent() {
    return this.mediaURI;
  }
 
  static make({data, store} = {}) {
    return new ImagePiece({data, store});
  }
}

module.exports = ImagePiece;