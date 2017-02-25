/*globals Camera, Template7*/
const $$ = window.Dom7;

const PAGESEL = `.page[data-page="imagePieceEditor"]`;

const ImagePiece = require("../models/ImagePiece.js");
const PieceEditorPage = require("./PieceEditorPage.js");

const _template = Template7.compile(require("../../html/pages/imagePieceEditor.html"));

class ImagePieceEditorPage extends PieceEditorPage {

    constructor({store, uuid, pageTitle} = {}) {
        super({store, uuid, pageTitle, name: "imagePieceEditor", pageSelector: "imagePieceEditor", Piece: ImagePiece, template: _template});
        this.piece = ImagePiece.make({store, data: {uuid}});
    }

    wireEventHandlers() {
        super.wireEventHandlers();

        this.takePicture = () => {
            let options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                allowEdit: false,
                correctOrientation: true,
                saveToPhotoAlbum: false,
                cameraDirection: Camera.Direction.BACK,
                targetWidth: 512,
                targetHeight: 512
            };

            // save information we'll need in case Android terminates us while
            // taking a picture
            localStorage.setItem("camera-in-progress", "YES");
            localStorage.setItem("piece-in-progress", this.piece.uuid);

            navigator.camera.getPicture((data) => {
                // now that we've got the picture, we can remove any in-progress
                // flags we have set
                localStorage.removeItem("camera-in-progress");
                localStorage.removeItem("piece-in-progress");

                this.piece.set("mediaURI", data);
                this.savePiece();
            }, (errMessage) => {
                // Even if we get an error, we need to remove in-progress
                // flags we have set
                localStorage.removeItem("camera-in-progress");
                localStorage.removeItem("piece-in-progress");

                window.app.modal({
                    title: "Couldn't take picture",
                    text: `Verify that this app has permission to access your camera.
                           Technical details: ${errMessage}`,
                    buttons: [
                        {text: "OK"}
                    ]
                });
            }, options);
        }

        $$(document).on("click", `.icon-camera.page-${this.pageSelector}`, this.takePicture);
    }

    unwireEventHandlers() {
        $$(document).off("click", `.icon-camera.page-${this.pageSelector}`, this.takePicture);
        super.unwireEventHandlers();
    }

    savePiece() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        let content = textarea[0].value;
        if (content !== this.piece.content) {
            this.piece.set("content",textarea[0].value);
        }
        super.savePiece();
    }

    onPieceChanged() {
        super.onPieceChanged();
        // update the editor
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.text(this.piece.content);
        // and the image
        let imageArea = $$(`${PAGESEL} .item-image`);
        imageArea.html(this.piece.getImageContent());
    }

    focusTextEditor() {
        let textarea = $$(`${PAGESEL} .piece-content`);
        textarea.focus();
    }

    makeDefaultPiece() {
        this.piece.set("title", "Image Caption");
        this.piece.set("content", "Add a description");
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
