import {expect} from "chai";
import {overlayReducer, actionTypes, overlayDefaultState} from "./use-overlay-reducer";

let originalState;
let newState;

const testImmutability = () => {
    it("should return a new state object", function() {
        expect(newState).to.not.equal(originalState);
    });
};

describe("Use Overlay Reducer", function() {
    describe("1. onCreate", function() {
        beforeEach(function() {
            originalState = {};
            newState = overlayReducer(overlayDefaultState, actionTypes.onCreate);
        });

        testImmutability();
    });

    describe("2. onUpdate", function () {
        beforeEach(function() {
            originalState = {};
            newState = overlayReducer(overlayDefaultState, actionTypes.onUpdate);
        });

        testImmutability();
    });

    describe("3. onDelete", function() {
        beforeEach(function() {
            originalState = {};
            newState = overlayReducer(overlayDefaultState, actionTypes.onDelete);
        });

        testImmutability();
    });
});
