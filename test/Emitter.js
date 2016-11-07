const Emitter = require("../www/js/lib/Emitter.js");
const expect = require("chai").expect;

describe ("Emitter", () => {
    describe ("#Create", () => {
        it("should be able to create a new emitter", () => {
            let emitter = new Emitter();
            expect(emitter).to.be.a("Object"); 
        });
    });
    describe ("#Events", () => {
        let emitter = new Emitter();
        let cbCount = 0;
        it("should be able to emit an event with no subscribers", () => {
            emitter.emit("change");
        });
        it("should be able to subscribe to an event with no prior subscribers", () => {
            emitter.subscribe("change", this, (sender, event, data) => {
                cbCount++;
            }, {blocking: true});
        });
        it("should be able to subscribe to an event with prior subscribers", () => {
            emitter.subscribe("change", this, (sender, event, data) => {
                cbCount++;
            }, {blocking: true});
        });
        it("should be able to emit an event with subscribers", () => {
            emitter.emit("change", null, {blocking: true});
            expect(cbCount).to.equal(2);
        });
        it("should be able to emit a non-blocking event with subscribers", (done) => {
            emitter.emit("change");
            setTimeout( () => {
              expect(cbCount).to.equal(4);
              done();
            }, 5);
        });
        it("should be able to emit a non-blocking debounced event with subscribers", (done) => {
            emitter.subscribe("change", this, (sender, event, data) => {
                cbCount++;
            }, {blocking: false, debounce: 100});
            emitter.emit("change");
            emitter.emit("change");
            setTimeout( () => {
              expect(cbCount).to.equal(9);
              emitter.emit("change");
              setTimeout( () => {
                expect(cbCount).to.equal(12);
                done();
              }, 110);
            }, 110);
        });
        it("should be able to emit a non-blocking debounced event with subscribers using last edge", (done) => {
            emitter.subscribe("change", this, (sender, event, data) => {
                cbCount++;
            }, {blocking: false, debounce: 100, edge: 1});
            emitter.emit("change");
            emitter.emit("change");
            setTimeout( () => {
              expect(cbCount).to.equal(17);
            }, 55);
            setTimeout( () => {
              expect(cbCount).to.equal(18);
              emitter.emit("change");
              setTimeout( () => {
                expect(cbCount).to.equal(21);
              }, 55);
              setTimeout( () => {
                expect(cbCount).to.equal(22);
                done();
              }, 110);
            }, 110);
        });
    });
});