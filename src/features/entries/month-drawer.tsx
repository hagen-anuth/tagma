'use client';

import {PlusIcon, XIcon} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

import {defaultDateFor, formatDay, monthLabels} from '@/lib/dates';
import {formatMoney} from '@/lib/money';
import {cn} from '@/lib/utils';

import {Button} from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {sheetHref} from '@/features/sheet/sheet-params';

import {useEntryDialog} from './entry-dialog-provider';

import type {Category, Entry} from '@/schemas/entry';
import type {Preferences} from '@/schemas/preferences';

interface MonthDrawerProps {
    year: number;
    month: number | null;
    categoryId: number | null;
    entries: readonly Entry[];
    categories: readonly Category[];
    preferences: Preferences;
}

export function MonthDrawer({
    year,
    month,
    categoryId,
    entries,
    categories,
    preferences,
}: MonthDrawerProps): React.ReactElement {
    const router = useRouter();
    const {openNew, openEdit} = useEntryDialog();

    const category = categories.find(c => c.id === categoryId) ?? null;
    const visible = category
        ? entries.filter(e => e.categoryId === category.id)
        : entries;
    const income = sumKind(visible, 'income');
    const spent = sumKind(visible, 'expense');
    const monthName =
        month === null
            ? ''
            : monthLabels(preferences.locale, 'long')[month - 1];

    return (
        <Sheet
            open={month !== null}
            onOpenChange={isOpen => {
                if (!isOpen) router.push(sheetHref({year}), {scroll: false});
            }}
        >
            <SheetContent className="w-full gap-0 sm:max-w-md">
                <SheetHeader className="border-b">
                    <SheetTitle className="text-[13px]">
                        {monthName} {year}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        {visible.length}{' '}
                        {visible.length === 1 ? 'entry' : 'entries'}
                    </SheetDescription>
                    {category && month !== null && (
                        <Link
                            href={sheetHref({year, month})}
                            scroll={false}
                            className="mt-2 inline-flex w-fit items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs hover:bg-accent"
                        >
                            {category.name}
                            <XIcon
                                className="size-3"
                                aria-label="clear filter"
                            />
                        </Link>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    {visible.length === 0 ? (
                        <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                            nothing recorded
                            {category ? ` for ${category.name}` : ''} yet
                        </p>
                    ) : (
                        <ul className="divide-y divide-border/60">
                            {visible.map(entry => (
                                <li key={entry.id}>
                                    <button
                                        type="button"
                                        onClick={() => openEdit(entry)}
                                        className="grid w-full grid-cols-[3.5rem_1fr_auto] items-baseline gap-3 px-4 py-2 text-left text-xs hover:bg-muted/70"
                                    >
                                        <span className="text-muted-foreground tabular-nums">
                                            {formatDay(
                                                entry.occurredOn,
                                                preferences.locale,
                                            )}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate">
                                                {entry.name}
                                            </span>
                                            <span className="block truncate text-[11px] text-muted-foreground">
                                                {entry.categoryName}
                                            </span>
                                        </span>
                                        <span
                                            className={cn(
                                                'tabular-nums',
                                                entry.kind === 'income' &&
                                                    'text-positive',
                                            )}
                                        >
                                            {entry.kind === 'income'
                                                ? '+'
                                                : '−'}
                                            {formatMoney(
                                                entry.amountCents,
                                                preferences,
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid gap-3 border-t bg-muted/40 p-4">
                    <dl className="grid grid-cols-3 gap-2 text-xs">
                        <Total
                            label="income"
                            value={formatMoney(income, preferences)}
                        />
                        <Total
                            label="spent"
                            value={formatMoney(spent, preferences)}
                        />
                        <Total
                            label="net"
                            value={formatMoney(income - spent, preferences)}
                            className={cn(
                                income - spent > 0 && 'text-positive',
                                income - spent < 0 && 'text-negative',
                            )}
                        />
                    </dl>
                    {month !== null && (
                        <Button
                            onClick={() =>
                                openNew({
                                    occurredOn: defaultDateFor(year, month),
                                    ...(category
                                        ? {categoryId: category.id}
                                        : {}),
                                })
                            }
                        >
                            <PlusIcon />
                            add to {monthName}
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface TotalProps {
    label: string;
    value: string;
    className?: string;
}

function Total({label, value, className}: TotalProps): React.ReactElement {
    return (
        <div>
            <dt className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className={cn('font-medium tabular-nums', className)}>
                {value}
            </dd>
        </div>
    );
}

function sumKind(entries: readonly Entry[], kind: Entry['kind']): number {
    return entries
        .filter(e => e.kind === kind)
        .reduce((sum, e) => sum + e.amountCents, 0);
}
