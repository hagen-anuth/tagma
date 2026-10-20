import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';
import Link from 'next/link';

import {formatMoney} from '@/lib/money';
import {cn} from '@/lib/utils';

import {Button} from '@/components/ui/button';

import {sheetHref} from './sheet-params';

import type {YearSheet} from './build-year-sheet';
import type {Preferences} from '@/schemas/preferences';

interface SheetHeaderProps {
    sheet: YearSheet;
    year: number;
    preferences: Preferences;
}

export function SheetHeader({
    sheet,
    year,
    preferences,
}: SheetHeaderProps): React.ReactElement {
    const {income, expense, net} = sheet.totals;
    const savingsRate =
        income.total > 0 ? Math.round((net.total / income.total) * 100) : null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b px-4 py-3">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                        href={sheetHref({year: year - 1})}
                        aria-label="Previous year"
                    >
                        <ChevronLeftIcon />
                    </Link>
                </Button>
                <h1 className="min-w-14 text-center text-base font-semibold tracking-tight">
                    {year}
                </h1>
                <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                        href={sheetHref({year: year + 1})}
                        aria-label="Next year"
                    >
                        <ChevronRightIcon />
                    </Link>
                </Button>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-2">
                <Stat label="income">
                    {formatMoney(income.total, preferences)}
                </Stat>
                <Stat label="spent">
                    {formatMoney(expense.total, preferences)}
                </Stat>
                <Stat
                    label="net"
                    className={cn(
                        net.total > 0 && 'text-positive',
                        net.total < 0 && 'text-negative',
                    )}
                >
                    {formatMoney(net.total, preferences)}
                </Stat>
                <Stat label="saved">
                    {savingsRate === null ? '–' : `${savingsRate} %`}
                </Stat>
            </dl>
        </div>
    );
}

interface StatProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

function Stat({label, className, children}: StatProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-0.5 sm:items-end">
            <dt className="text-2xs tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className={cn('text-base font-medium tabular-nums', className)}>
                {children}
            </dd>
        </div>
    );
}
