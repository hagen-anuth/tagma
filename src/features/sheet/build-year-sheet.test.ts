import {describe, expect, it} from 'vitest';

import {buildYearSheet} from './build-year-sheet';

import type {Category} from '@/schemas/entry';

const CATEGORIES: Category[] = [
    {id: 1, name: 'salary', kind: 'income', sortOrder: 10},
    {id: 2, name: 'rent', kind: 'expense', sortOrder: 10},
    {id: 3, name: 'groceries', kind: 'expense', sortOrder: 20},
    {id: 4, name: 'books', kind: 'expense', sortOrder: 20},
];

function months(values: Record<number, number>): number[] {
    return Array.from({length: 12}, (_, i) => values[i + 1] ?? 0);
}

describe('buildYearSheet', () => {
    const sheet = buildYearSheet(CATEGORIES, [
        {categoryId: 1, month: 1, totalCents: 300_000},
        {categoryId: 1, month: 2, totalCents: 300_000},
        {categoryId: 2, month: 1, totalCents: 110_000},
        {categoryId: 2, month: 2, totalCents: 110_000},
        {categoryId: 3, month: 2, totalCents: 41_230},
        {categoryId: 3, month: 12, totalCents: 5_000},
    ]);

    it('splits rows by kind, ordered by sort order then name', () => {
        expect(sheet.income.map(r => r.category.name)).toEqual(['salary']);
        expect(sheet.expense.map(r => r.category.name)).toEqual([
            'rent',
            'books',
            'groceries',
        ]);
    });

    it('places each total in its month and sums the row', () => {
        const groceries = sheet.expense.find(r => r.category.id === 3);
        expect(groceries?.series).toEqual({
            months: months({2: 41_230, 12: 5_000}),
            total: 46_230,
        });
    });

    it('keeps categories without entries as zero rows', () => {
        const books = sheet.expense.find(r => r.category.id === 4);
        expect(books?.series).toEqual({months: months({}), total: 0});
    });

    it('totals income, expenses and net per month and for the year', () => {
        expect(sheet.totals.income).toEqual({
            months: months({1: 300_000, 2: 300_000}),
            total: 600_000,
        });
        expect(sheet.totals.expense).toEqual({
            months: months({1: 110_000, 2: 151_230, 12: 5_000}),
            total: 266_230,
        });
        expect(sheet.totals.net).toEqual({
            months: months({1: 190_000, 2: 148_770, 12: -5_000}),
            total: 333_770,
        });
    });

    it('adds up repeated rows for the same category and month', () => {
        const repeated = buildYearSheet(CATEGORIES, [
            {categoryId: 2, month: 3, totalCents: 100},
            {categoryId: 2, month: 3, totalCents: 50},
        ]);
        expect(repeated.expense[0]?.series.months[2]).toBe(150);
    });

    it('ignores months outside 1–12 and unknown categories', () => {
        const odd = buildYearSheet(CATEGORIES, [
            {categoryId: 2, month: 0, totalCents: 100},
            {categoryId: 2, month: 13, totalCents: 100},
            {categoryId: 99, month: 1, totalCents: 100},
        ]);
        expect(odd.totals.expense.total).toBe(0);
    });
});
