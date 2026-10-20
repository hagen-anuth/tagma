import dayjs from 'dayjs';

/** ISO calendar dates (`YYYY-MM-DD`) throughout; no times, no time zones. */
const ISO_DATE = 'YYYY-MM-DD';

export function todayIso(): string {
    return dayjs().format(ISO_DATE);
}

/** `[first day, first day of the next month)`, month 1–12. */
export function monthRange(year: number, month: number): [string, string] {
    const start = dayjs(new Date(year, month - 1, 1));
    return [start.format(ISO_DATE), start.add(1, 'month').format(ISO_DATE)];
}

export function yearRange(year: number): [string, string] {
    return [`${year}-01-01`, `${year + 1}-01-01`];
}

/** Today when it falls in the month, else the month's first day. */
export function defaultDateFor(year: number, month: number): string {
    const today = dayjs();
    if (today.year() === year && today.month() + 1 === month) {
        return today.format(ISO_DATE);
    }
    return monthRange(year, month)[0];
}

export function monthLabels(
    locale: string,
    style: 'short' | 'long' = 'short',
): string[] {
    const format = new Intl.DateTimeFormat(locale, {
        month: style,
        timeZone: 'UTC',
    });
    return Array.from({length: 12}, (_, i) =>
        format.format(Date.UTC(2000, i, 1)).replace(/\.$/, ''),
    );
}

export function formatDay(isoDate: string, locale: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC',
    }).format(Date.UTC(year ?? 2000, (month ?? 1) - 1, day ?? 1));
}
