import Link from 'next/link';

import {monthLabels} from '@/lib/dates';
import {formatAmount} from '@/lib/money';
import {cn} from '@/lib/utils';

import {sheetHref} from './sheet-params';

import type {MonthSeries, SheetRow, YearSheet} from './build-year-sheet';
import type {Preferences} from '@/schemas/preferences';

interface YearSheetTableProps {
    sheet: YearSheet;
    year: number;
    preferences: Preferences;
    selectedMonth: number | null;
    /** 1–12 when the shown year is the current one */
    currentMonth: number | null;
}

const MONTHS = Array.from({length: 12}, (_, i) => i + 1);

export function YearSheetTable({
    sheet,
    year,
    preferences,
    selectedMonth,
    currentMonth,
}: YearSheetTableProps): React.ReactElement {
    const labels = monthLabels(preferences.locale);
    const {locale} = preferences;

    function columnClass(month: number): string {
        return cn(
            month === currentMonth && 'bg-highlight',
            month === selectedMonth && 'bg-accent',
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed border-collapse text-sm tabular-nums">
                <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase">
                        <th className="sticky left-0 z-10 w-40 bg-card px-4 py-2.5 text-left font-medium tracking-wider">
                            {preferences.currency}
                        </th>
                        {MONTHS.map(month => (
                            <th
                                key={month}
                                className={cn(
                                    'p-0 font-medium',
                                    columnClass(month),
                                )}
                            >
                                <Link
                                    href={sheetHref({year, month})}
                                    scroll={false}
                                    className={cn(
                                        'block px-2 py-2.5 text-right tracking-wider hover:text-foreground',
                                        month === selectedMonth &&
                                            'text-foreground',
                                    )}
                                >
                                    {labels[month - 1]}
                                </Link>
                            </th>
                        ))}
                        <th className="w-32 border-l px-4 py-2.5 text-right font-medium tracking-wider">
                            Σ {year}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <SectionHeading label="income" />
                    {sheet.income.map(row => (
                        <CategoryRow
                            key={row.category.id}
                            row={row}
                            year={year}
                            locale={locale}
                            columnClass={columnClass}
                        />
                    ))}
                    <SectionHeading label="expenses" />
                    {sheet.expense.map(row => (
                        <CategoryRow
                            key={row.category.id}
                            row={row}
                            year={year}
                            locale={locale}
                            columnClass={columnClass}
                        />
                    ))}
                </tbody>

                <tfoot className="border-t-2 border-foreground/15 font-medium">
                    <TotalRow
                        label="income"
                        series={sheet.totals.income}
                        locale={locale}
                        columnClass={columnClass}
                    />
                    <TotalRow
                        label="spent"
                        series={sheet.totals.expense}
                        locale={locale}
                        columnClass={columnClass}
                    />
                    <TotalRow
                        label="net"
                        series={sheet.totals.net}
                        locale={locale}
                        columnClass={columnClass}
                        isSigned
                    />
                </tfoot>
            </table>
        </div>
    );
}

function SectionHeading({label}: {label: string}): React.ReactElement {
    return (
        <tr>
            <th
                colSpan={14}
                className="sticky left-0 bg-card px-4 pt-4 pb-1.5 text-left text-2xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
            >
                {label}
            </th>
        </tr>
    );
}

interface CategoryRowProps {
    row: SheetRow;
    year: number;
    locale: string;
    columnClass: (month: number) => string;
}

function CategoryRow({
    row,
    year,
    locale,
    columnClass,
}: CategoryRowProps): React.ReactElement {
    const {category, series} = row;
    const isEmpty = series.total === 0;

    return (
        <tr className="group border-b border-border/60 last:border-b-0 hover:bg-muted/60">
            <th
                scope="row"
                className={cn(
                    'sticky left-0 z-10 bg-card px-4 py-1.5 text-left font-normal group-hover:bg-muted',
                    isEmpty && 'text-muted-foreground',
                )}
            >
                {category.name}
            </th>
            {series.months.map((cents, i) => {
                const month = i + 1;
                return (
                    <td key={month} className={cn('p-0', columnClass(month))}>
                        <Link
                            href={sheetHref({
                                year,
                                month,
                                categoryId: category.id,
                            })}
                            scroll={false}
                            className="block px-2 py-1.5 text-right hover:bg-foreground/5"
                        >
                            <Amount cents={cents} locale={locale} />
                        </Link>
                    </td>
                );
            })}
            <td className="border-l px-4 py-1.5 text-right font-medium">
                <Amount cents={series.total} locale={locale} />
            </td>
        </tr>
    );
}

interface TotalRowProps {
    label: string;
    series: MonthSeries;
    locale: string;
    columnClass: (month: number) => string;
    isSigned?: boolean;
}

function TotalRow({
    label,
    series,
    locale,
    columnClass,
    isSigned = false,
}: TotalRowProps): React.ReactElement {
    return (
        <tr className={cn(isSigned && 'border-t text-base')}>
            <th
                scope="row"
                className="sticky left-0 z-10 bg-card px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
            >
                {label}
            </th>
            {series.months.map((cents, i) => (
                <td
                    key={i}
                    className={cn('px-2 py-2 text-right', columnClass(i + 1))}
                >
                    <Amount cents={cents} locale={locale} isSigned={isSigned} />
                </td>
            ))}
            <td className="border-l px-4 py-2 text-right">
                <Amount
                    cents={series.total}
                    locale={locale}
                    isSigned={isSigned}
                />
            </td>
        </tr>
    );
}

interface AmountProps {
    cents: number;
    locale: string;
    isSigned?: boolean;
}

function Amount({
    cents,
    locale,
    isSigned = false,
}: AmountProps): React.ReactElement {
    if (cents === 0) {
        return <span className="text-muted-foreground/50">·</span>;
    }
    const text = formatAmount(Math.abs(cents), locale);
    if (!isSigned) return <span>{text}</span>;
    return (
        <span className={cents > 0 ? 'text-positive' : 'text-negative'}>
            {cents > 0 ? '+' : '−'}
            {text}
        </span>
    );
}
