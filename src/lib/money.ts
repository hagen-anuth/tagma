import {MAX_AMOUNT_CENTS} from '@/schemas/entry';

import type {Preferences} from '@/schemas/preferences';

const MAX_INPUT_LENGTH = 20;

/**
 * Parses user input such as `12,50`, `1.234,56`, `1,234.56` or `€ 12` into
 * cents. Returns null for anything that is not a positive amount.
 *
 * A lone separator followed by exactly three digits is ambiguous (`1.234`);
 * it is read as the locale's decimal separator if it is one, as grouping
 * otherwise.
 */
export function parseAmount(input: string, locale: string): number | null {
    if (input.length > MAX_INPUT_LENGTH) return null;
    const cleaned = input.replace(/[\s  €$£]/g, '');
    if (!/^[\d.,]+$/.test(cleaned) || !/\d/.test(cleaned)) return null;

    const decimalSeparator = getDecimalSeparator(locale);
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    let decimalIndex = -1;

    if (lastDot !== -1 && lastComma !== -1) {
        decimalIndex = Math.max(lastDot, lastComma);
    } else if (lastDot !== -1 || lastComma !== -1) {
        const separator = lastDot !== -1 ? '.' : ',';
        const index = Math.max(lastDot, lastComma);
        const occurrences = cleaned.split(separator).length - 1;
        const digitsAfter = cleaned.length - index - 1;
        const isDecimal =
            occurrences === 1 &&
            (digitsAfter <= 2 ||
                (digitsAfter === 3 && separator === decimalSeparator));
        if (isDecimal) decimalIndex = index;
    }

    const groups = (
        decimalIndex === -1 ? cleaned : cleaned.slice(0, decimalIndex)
    ).split(/[.,]/);
    const fractionPart =
        decimalIndex === -1 ? '' : cleaned.slice(decimalIndex + 1);

    if (/[.,]/.test(fractionPart) || fractionPart.length > 2) return null;
    if (groups.length > 1 && !isThousandsGrouping(groups)) return null;
    const integerPart = groups.join('');

    const cents =
        Number(integerPart || '0') * 100 +
        Number(fractionPart.padEnd(2, '0') || '0');

    if (!Number.isSafeInteger(cents) || cents <= 0) return null;
    if (cents > MAX_AMOUNT_CENTS) return null;
    return cents;
}

/** With currency symbol, for single values. */
export function formatMoney(cents: number, preferences: Preferences): string {
    return new Intl.NumberFormat(preferences.locale, {
        style: 'currency',
        currency: preferences.currency,
    }).format(cents / 100);
}

/** Without symbol, for sheet cells where the currency sits in the header. */
export function formatAmount(cents: number, locale: string): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cents / 100);
}

/** Plain input value, e.g. `1234,5` → `1234,50` for de-DE. */
export function formatAmountInput(cents: number, locale: string): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false,
    }).format(cents / 100);
}

function isThousandsGrouping(groups: readonly string[]): boolean {
    const [first = '', ...rest] = groups;
    return (
        first.length >= 1 &&
        first.length <= 3 &&
        rest.every(group => group.length === 3)
    );
}

function getDecimalSeparator(locale: string): string {
    const part = new Intl.NumberFormat(locale)
        .formatToParts(1.5)
        .find(p => p.type === 'decimal');
    return part?.value ?? '.';
}
