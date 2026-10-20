export interface SheetParams {
    year: number;
    /** 1–12; null when no month drawer is open */
    month: number | null;
    /** narrows the month drawer to one category */
    categoryId: number | null;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseSheetParams(
    raw: RawSearchParams,
    now: Date = new Date(),
): SheetParams {
    const year = readInt(raw.year, 1970, 2999) ?? now.getFullYear();
    const month = readInt(raw.month, 1, 12);
    const categoryId =
        month === null
            ? null
            : readInt(raw.category, 1, Number.MAX_SAFE_INTEGER);
    return {year, month, categoryId};
}

export function sheetHref({
    year,
    month = null,
    categoryId = null,
}: Pick<SheetParams, 'year'> & Partial<SheetParams>): string {
    const params = new URLSearchParams({year: String(year)});
    if (month !== null) params.set('month', String(month));
    if (month !== null && categoryId !== null) {
        params.set('category', String(categoryId));
    }
    return `/?${params.toString()}`;
}

function readInt(
    value: string | string[] | undefined,
    min: number,
    max: number,
): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined || !/^\d+$/.test(raw)) return null;
    const parsed = Number(raw);
    return parsed >= min && parsed <= max ? parsed : null;
}
