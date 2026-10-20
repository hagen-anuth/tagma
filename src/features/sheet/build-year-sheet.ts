import type {Category} from '@/schemas/entry';

export interface MonthlyTotal {
    categoryId: number;
    /** 1–12 */
    month: number;
    totalCents: number;
}

/** Twelve monthly values, January first, plus their sum. All in cents. */
export interface MonthSeries {
    months: number[];
    total: number;
}

export interface SheetRow {
    category: Category;
    series: MonthSeries;
}

export interface YearSheet {
    income: SheetRow[];
    expense: SheetRow[];
    totals: {
        income: MonthSeries;
        expense: MonthSeries;
        net: MonthSeries;
    };
}

export function buildYearSheet(
    categories: readonly Category[],
    monthlyTotals: readonly MonthlyTotal[],
): YearSheet {
    const byCategory = new Map<number, number[]>();
    for (const {categoryId, month, totalCents} of monthlyTotals) {
        if (month < 1 || month > 12) continue;
        const months = byCategory.get(categoryId) ?? emptyMonths();
        months[month - 1] = (months[month - 1] ?? 0) + totalCents;
        byCategory.set(categoryId, months);
    }

    const rows = [...categories]
        .sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        )
        .map(category => ({
            category,
            series: toSeries(byCategory.get(category.id) ?? emptyMonths()),
        }));

    const income = rows.filter(row => row.category.kind === 'income');
    const expense = rows.filter(row => row.category.kind === 'expense');
    const incomeTotals = sumSeries(income);
    const expenseTotals = sumSeries(expense);

    return {
        income,
        expense,
        totals: {
            income: incomeTotals,
            expense: expenseTotals,
            net: toSeries(
                incomeTotals.months.map(
                    (value, i) => value - (expenseTotals.months[i] ?? 0),
                ),
            ),
        },
    };
}

function emptyMonths(): number[] {
    return Array.from({length: 12}, () => 0);
}

function toSeries(months: number[]): MonthSeries {
    return {months, total: months.reduce((sum, value) => sum + value, 0)};
}

function sumSeries(rows: readonly SheetRow[]): MonthSeries {
    const months = emptyMonths();
    for (const row of rows) {
        row.series.months.forEach((value, i) => {
            months[i] = (months[i] ?? 0) + value;
        });
    }
    return toSeries(months);
}
