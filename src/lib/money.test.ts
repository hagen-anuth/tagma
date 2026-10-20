import {describe, expect, it} from 'vitest';

import {
    formatAmount,
    formatAmountInput,
    formatMoney,
    parseAmount,
} from './money';

describe('parseAmount', () => {
    it.each([
        ['12', 1200],
        ['12,5', 1250],
        ['12,50', 1250],
        ['12.50', 1250],
        ['0,99', 99],
        ['1.234,56', 123456],
        ['1,234.56', 123456],
        ['1.234', 123400],
        ['123.456,7', 12345670],
        [' 42,00 € ', 4200],
        ['€12', 1200],
    ])('reads %j in de-DE as %i cents', (input, cents) => {
        expect(parseAmount(input, 'de-DE')).toBe(cents);
    });

    it('reads a lone three-digit group by the locale decimal separator', () => {
        expect(parseAmount('1,234', 'en-US')).toBe(123400);
        expect(parseAmount('1.234', 'en-US')).toBeNull();
    });

    it.each(['', '   ', 'abc', '0', '0,00', '-5', '12,345', '1,2,3', '12x'])(
        'rejects %j',
        input => {
            expect(parseAmount(input, 'de-DE')).toBeNull();
        },
    );

    it('rejects amounts above the per-entry limit', () => {
        expect(parseAmount('1000000,01', 'de-DE')).toBeNull();
        expect(parseAmount('1000000', 'de-DE')).toBe(100_000_000);
    });
});

describe('formatting', () => {
    const de = {currency: 'EUR', locale: 'de-DE'} as const;

    it('formats sheet cells without a symbol', () => {
        expect(formatAmount(123456, 'de-DE')).toBe('1.234,56');
        expect(formatAmount(123456, 'en-US')).toBe('1,234.56');
    });

    it('formats single values with the currency', () => {
        expect(formatMoney(123456, de)).toBe('1.234,56 €');
        expect(formatMoney(5, {currency: 'USD', locale: 'en-US'})).toBe(
            '$0.05',
        );
    });

    it('produces input text that parses back to the same cents', () => {
        for (const cents of [1, 99, 1250, 123456]) {
            const text = formatAmountInput(cents, 'de-DE');
            expect(parseAmount(text, 'de-DE')).toBe(cents);
        }
    });
});
