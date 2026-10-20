import {describe, expect, it} from 'vitest';

import {moveId, sortOrdersFor} from './reorder';

describe('moveId', () => {
    const ids = [1, 2, 3, 4];

    it('moves up and down by one', () => {
        expect(moveId(ids, 3, -1)).toEqual([1, 3, 2, 4]);
        expect(moveId(ids, 2, 1)).toEqual([1, 3, 2, 4]);
    });

    it('returns null at either end and for unknown ids', () => {
        expect(moveId(ids, 1, -1)).toBeNull();
        expect(moveId(ids, 4, 1)).toBeNull();
        expect(moveId(ids, 9, 1)).toBeNull();
    });

    it('clamps larger offsets', () => {
        expect(moveId(ids, 2, 10)).toEqual([1, 3, 4, 2]);
    });

    it('leaves the input untouched', () => {
        moveId(ids, 3, -1);
        expect(ids).toEqual([1, 2, 3, 4]);
    });
});

describe('sortOrdersFor', () => {
    it('numbers in steps of ten from ten', () => {
        expect([...sortOrdersFor([7, 3, 5])]).toEqual([
            [7, 10],
            [3, 20],
            [5, 30],
        ]);
    });
});
