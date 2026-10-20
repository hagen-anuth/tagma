/**
 * Moves `id` by `offset` places within `ids`, clamped to the ends.
 * Returns null when nothing would change.
 */
export function moveId(
    ids: readonly number[],
    id: number,
    offset: number,
): number[] | null {
    const from = ids.indexOf(id);
    if (from === -1) return null;
    const to = Math.min(Math.max(from + offset, 0), ids.length - 1);
    if (to === from) return null;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, id);
    return next;
}

/** Spaced sort orders, so a category added at the end needs no renumbering. */
export function sortOrdersFor(ids: readonly number[]): Map<number, number> {
    return new Map(ids.map((id, i) => [id, (i + 1) * 10]));
}
