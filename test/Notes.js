const Entity = require("../www/js/models/Notes.js");

const EntityStore = require("../www/js/store/EntityStore.js");
const LocalStorageAdapter = require("../www/js/store/adapters/LocalStorageAdapter.js");

const Notes = require("../www/js/models/Notes.js");
const Note = require("../www/js/models/Note.js");
const PieceFactory = require("../www/js/factories/PieceFactory.js");
const PIECE = require("../www/js/constants/Piece.js");


const expect = require("chai").expect;

describe("Notes", () => {
    describe("#test", () => {
        it("should be able to save and retrieve notes", (done) => {

            const adapter = LocalStorageAdapter.make();
            const store = EntityStore.make(adapter);

            let piece1 = PieceFactory.make(PIECE.TEXTPIECETYPE,
                { data: { title: "Location" }, store });
            let piece2 = PieceFactory.make(PIECE.TEXTPIECETYPE,
                { data: { title: "Confirmation" }, store });

            let note = Note.make({ data: { title: "Vacation TODOs" }, store });
            note.content = [piece1, piece2];

            let notes = Notes.make({ store });
            notes.content = [note];
            let aNewNotes;
            notes.save().then(() => {
                aNewNotes = Notes.make({ data: { uuid: notes.uuid }, store });
                return aNewNotes.load();
            }).then(() => {
                expect(aNewNotes).to.deep.equal(notes);
                done();
            }).catch(done);
        });
    });
});