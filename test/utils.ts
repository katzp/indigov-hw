import { describe, context, it } from 'mocha'
import { expect } from 'chai';
import { hashObject } from "../lib/utils";

describe('hashObject function', () => {
    context('When given same object values in different order', () => {
        const a = { b: 1, c: 5 };
        const b = { c: 5, b: 1 };
        it('returns the same hash', () => {
            expect(hashObject(a)).to.eql(hashObject(b));
        })
    })
})
