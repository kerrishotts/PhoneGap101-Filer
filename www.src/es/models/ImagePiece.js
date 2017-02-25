/*global device*/
const Piece = require("./Piece.js");
const PIECE = require("../constants/piece.js");

class ImagePiece extends Piece {
  _overlay(data) {
    super._overlay(data);
    this.type = (data && data.type) || PIECE.IMAGEPIECETYPE;
  }

  getImageContent() {
    return this.renderImageContent(this.mediaURI === "" ? {
      type: "icon",
      image: "camera"
    } : {
      type: /*device.platform === "browser" ?*/ "base64" /*: "image"*/, // base64 for now, although not ideal
      image: this.mediaURI
    });
  }
 
  static make({data, store} = {}) {
    return new ImagePiece({data, store});
  }
}

module.exports = ImagePiece;