import {describe, expect, it} from 'vitest';

import {
    findCanonicalName,
    normalizeName,
    rankSuggestions,
    type NameSuggestion,
} from './name-suggestions';

function suggestion(name: string): NameSuggestion {
    return {name, uses: 1, lastAmountCents: 100, lastUsedOn: '2026-10-01'};
}

const NAMES = [
    'health insurance',
    'liability insurance',
    'Health insurance',
    'dental health',
    'gym',
].map(suggestion);

const names = (list: NameSuggestion[]) => list.map(s => s.name);

describe('normalizeName', () => {
    it('trims and collapses inner whitespace', () => {
        expect(normalizeName('  health   insurance ')).toBe('health insurance');
    });
});

describe('rankSuggestions', () => {
    it('returns everything in incoming order for an empty query', () => {
        expect(names(rankSuggestions(NAMES, '  '))).toEqual(names(NAMES));
    });

    it('matches case-insensitively and ranks prefix, word start, mid-word', () => {
        expect(names(rankSuggestions(NAMES, 'HEAL'))).toEqual([
            'health insurance',
            'Health insurance',
            'dental health',
        ]);
        expect(names(rankSuggestions(NAMES, 'sur'))).toEqual([
            'health insurance',
            'liability insurance',
            'Health insurance',
        ]);
    });

    it('treats repeated spaces in the query like one', () => {
        expect(names(rankSuggestions(NAMES, 'health   ins'))).toEqual([
            'health insurance',
            'Health insurance',
        ]);
    });

    it('limits the result', () => {
        expect(rankSuggestions(NAMES, '', 2)).toHaveLength(2);
    });

    it('returns nothing when nothing matches', () => {
        expect(rankSuggestions(NAMES, 'rent')).toEqual([]);
    });
});

describe('findCanonicalName', () => {
    it('returns the first recorded spelling for a case or spacing variant', () => {
        expect(findCanonicalName(NAMES, 'HEALTH  insurance ')).toBe(
            'health insurance',
        );
    });

    it('returns null for an exact match, a new name or empty input', () => {
        expect(findCanonicalName(NAMES, 'health insurance')).toBeNull();
        expect(findCanonicalName(NAMES, 'health care')).toBeNull();
        expect(findCanonicalName(NAMES, ' ')).toBeNull();
    });
});
