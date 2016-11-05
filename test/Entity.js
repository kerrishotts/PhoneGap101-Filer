const Entity = require("../www/js/lib/Entity.js");
const expect = require("chai").expect;

describe ("Entity", () => {
    describe ("#Create", () => {
        it("should be able to create a new entity", () => {
            let entity = new Entity();
            expect(entity).to.be.a("Object"); 
        });
        it("should be able to create a new entity with a UUID", () => {
            let uuid = Entity.makeUniqueIdentifier();
            let entity = new Entity({data: {uuid}});
            expect(entity).to.be.a("Object")
                          .and.have.property("uuid")
                          .equal(uuid);
        });
    });
    describe ("#Marshalling", () => {
        it("should be able to serialize/marshal", () => {
            let uuid = Entity.makeUniqueIdentifier();
            let entity = new Entity({data: {uuid}});
            let data = entity.serialize({prettify: false});
            let expectedObject = {"uuid": uuid};
            expect(data).to.equal(JSON.stringify(expectedObject));
        });
        it("should be able to deserialize/unmarshal", () => {
            let uuid = Entity.makeUniqueIdentifier();
            let data = JSON.stringify({uuid});
            let entity = new Entity();
            entity.deserialize(data);
            expect(entity).to.be.a("Object")
                          .and.have.property("uuid")
                          .equal(uuid);
        });
    });
});