export interface NameSuggestion {
    name: string;
    uses: number;
    lastAmountCents: number;
    /** ISO date */
    lastUsedOn: string;
}

/** Per category id, most used first, then most recent. */
export type NameSuggestionsByCategory = Readonly<
    Record<number, readonly NameSuggestion[]>
>;

export function normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
}

/**
 * Narrows to names containing the query, case-insensitively. A match at the
 * start ranks above one at a word start, which ranks above one mid-word;
 * within a rank the incoming order holds.
 */
export function rankSuggestions(
    suggestions: readonly NameSuggestion[],
    query: string,
    limit = 8,
): NameSuggestion[] {
    const needle = normalizeName(query).toLowerCase();
    if (!needle) return suggestions.slice(0, limit);

    return suggestions
        .map((suggestion, order) => ({
            suggestion,
            order,
            rank: matchRank(suggestion.name.toLowerCase(), needle),
        }))
        .filter(item => item.rank !== null)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.order - b.order)
        .slice(0, limit)
        .map(item => item.suggestion);
}

/**
 * The existing spelling of `input` when it differs only in case or spacing,
 * else null. With several variants on record, the first (most used) wins.
 */
export function findCanonicalName(
    suggestions: readonly NameSuggestion[],
    input: string,
): string | null {
    const normalized = normalizeName(input);
    const key = normalized.toLowerCase();
    if (!key) return null;
    const match = suggestions.find(s => s.name.toLowerCase() === key);
    return match && match.name !== normalized ? match.name : null;
}

function matchRank(name: string, needle: string): number | null {
    const index = name.indexOf(needle);
    if (index === -1) return null;
    if (index === 0) return 0;
    return /\s/.test(name[index - 1] ?? '') ? 1 : 2;
}
