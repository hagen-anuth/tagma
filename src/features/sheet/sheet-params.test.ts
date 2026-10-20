import {describe, expect, it} from 'vitest';

import {parseSheetParams, sheetHref} from './sheet-params';

const NOW = new Date(2026, 9, 20);

describe('parseSheetParams', () => {
    it('defaults to the current year with no month open', () => {
        expect(parseSheetParams({}, NOW)).toEqual({
            year: 2026,
            month: null,
            categoryId: null,
        });
    });

    it('reads year, month and category', () => {
        expect(
            parseSheetParams({year: '2025', month: '3', category: '7'}, NOW),
        ).toEqual({year: 2025, month: 3, categoryId: 7});
    });

    it('drops invalid values instead of failing', () => {
        expect(
            parseSheetParams({year: 'abc', month: '13', category: '7'}, NOW),
        ).toEqual({year: 2026, month: null, categoryId: null});
        expect(parseSheetParams({month: '-1'}, NOW).month).toBeNull();
    });

    it('takes the first of repeated params', () => {
        expect(parseSheetParams({year: ['2024', '2025']}, NOW).year).toBe(2024);
    });
});

describe('sheetHref', () => {
    it('round-trips through parseSheetParams', () => {
        const params = {year: 2026, month: 10, categoryId: 4};
        const query = new URLSearchParams(sheetHref(params).slice(2));
        expect(parseSheetParams(Object.fromEntries(query), NOW)).toEqual(
            params,
        );
    });

    it('omits the category when no month is set', () => {
        expect(sheetHref({year: 2026, categoryId: 4})).toBe('/?year=2026');
    });
});
