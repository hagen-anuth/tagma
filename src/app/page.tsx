import {connection} from 'next/server';
import {Suspense} from 'react';

import {LogoMark} from '@/components/logo-mark';
import {ThemeToggle} from '@/components/theme-toggle';
import {CategoryManager} from '@/features/categories/category-manager';
import {
    getCategories,
    getCategoryEntryCounts,
} from '@/features/categories/queries';
import {EntryDialogProvider} from '@/features/entries/entry-dialog-provider';
import {MonthDrawer} from '@/features/entries/month-drawer';
import {NewEntryButton} from '@/features/entries/new-entry-button';
import {getNameSuggestions} from '@/features/entries/queries';
import {PreferencesPopover} from '@/features/preferences/preferences-popover';
import {getPreferences} from '@/features/preferences/queries';
import {buildYearSheet} from '@/features/sheet/build-year-sheet';
import {getMonthEntries, getMonthlyTotals} from '@/features/sheet/queries';
import {SheetHeader} from '@/features/sheet/sheet-header';
import {parseSheetParams} from '@/features/sheet/sheet-params';
import {YearSheetTable} from '@/features/sheet/year-sheet-table';

export default function Home({searchParams}: PageProps<'/'>) {
    return (
        <Suspense fallback={<Shell />}>
            <Workbench searchParams={searchParams} />
        </Suspense>
    );
}

async function Workbench({
    searchParams,
}: Pick<PageProps<'/'>, 'searchParams'>): Promise<React.ReactElement> {
    // the sheet defaults to, and highlights, the current month
    await connection();
    const now = new Date();
    const params = parseSheetParams(await searchParams, now);
    const [
        preferences,
        categories,
        entryCounts,
        nameSuggestions,
        monthlyTotals,
        monthEntries,
    ] = await Promise.all([
        getPreferences(),
        getCategories(),
        getCategoryEntryCounts(),
        getNameSuggestions(),
        getMonthlyTotals(params.year),
        params.month === null
            ? Promise.resolve([])
            : getMonthEntries(params.year, params.month),
    ]);
    const sheet = buildYearSheet(categories, monthlyTotals);
    const currentMonth =
        now.getFullYear() === params.year ? now.getMonth() + 1 : null;

    return (
        <EntryDialogProvider
            categories={categories}
            nameSuggestions={nameSuggestions}
            preferences={preferences}
        >
            <Shell
                actions={
                    <>
                        <NewEntryButton />
                        <CategoryManager
                            categories={categories}
                            entryCounts={entryCounts}
                        />
                        <PreferencesPopover preferences={preferences} />
                        <ThemeToggle />
                    </>
                }
            >
                <SheetHeader
                    sheet={sheet}
                    year={params.year}
                    preferences={preferences}
                />
                <YearSheetTable
                    sheet={sheet}
                    year={params.year}
                    preferences={preferences}
                    selectedMonth={params.month}
                    currentMonth={currentMonth}
                />
            </Shell>
            <MonthDrawer
                year={params.year}
                month={params.month}
                categoryId={params.categoryId}
                entries={monthEntries}
                categories={categories}
                preferences={preferences}
            />
        </EntryDialogProvider>
    );
}

interface ShellProps {
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

function Shell({actions, children}: ShellProps): React.ReactElement {
    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-8 sm:py-10">
            <header className="flex h-8 items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <LogoMark />
                    <span className="text-base font-semibold tracking-tight">
                        tagma
                    </span>
                </div>
                <div className="flex items-center gap-1.5">{actions}</div>
            </header>
            <main className="overflow-hidden rounded-xl border bg-card shadow-float">
                {children ?? (
                    <div className="grid h-[480px] place-items-center text-xs text-muted-foreground">
                        loading…
                    </div>
                )}
            </main>
            <footer className="text-center text-xs text-muted-foreground">
                click a month or cell to see its entries
            </footer>
        </div>
    );
}
