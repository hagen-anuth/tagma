import Image from 'next/image';
import Link from 'next/link';

import {formatAmount, formatMoney} from '@/lib/money';
import {cn} from '@/lib/utils';

import {LogoMark} from '@/components/logo-mark';
import {ThemeToggle} from '@/components/theme-toggle';
import {buildYearSheet} from '@/features/sheet/build-year-sheet';
import {SheetHeader} from '@/features/sheet/sheet-header';
import {YearSheetTable} from '@/features/sheet/year-sheet-table';
import {ColorTokens} from '@/features/styleguide/color-tokens';
import {Buttons, Fields, Overlays} from '@/features/styleguide/primitives';
import {RADII, TYPE_SCALE} from '@/features/styleguide/tokens';
import {DEFAULT_PREFERENCES} from '@/schemas/preferences';

import type {Category} from '@/schemas/entry';
import type {Metadata} from 'next';

export const metadata: Metadata = {title: 'styleguide · tagma'};

const SECTIONS = [
    ['brand', 'brand'],
    ['color', 'colour'],
    ['type', 'type'],
    ['shape', 'shape & depth'],
    ['primitives', 'primitives'],
    ['data', 'data'],
] as const;

const SAMPLE_CATEGORIES: Category[] = [
    {id: 1, name: 'salary', kind: 'income', sortOrder: 10},
    {id: 2, name: 'rent', kind: 'expense', sortOrder: 10},
    {id: 3, name: 'insurance', kind: 'expense', sortOrder: 20},
    {id: 4, name: 'groceries', kind: 'expense', sortOrder: 30},
    {id: 5, name: 'leisure', kind: 'expense', sortOrder: 40},
];

const SAMPLE_SHEET = buildYearSheet(SAMPLE_CATEGORIES, [
    ...[8, 9, 10].map(month => ({categoryId: 1, month, totalCents: 320_000})),
    ...[8, 9, 10].map(month => ({categoryId: 2, month, totalCents: 110_000})),
    ...[8, 9, 10].map(month => ({categoryId: 3, month, totalCents: 9_150})),
    {categoryId: 4, month: 8, totalCents: 40_175},
    {categoryId: 4, month: 9, totalCents: 37_620},
    {categoryId: 4, month: 10, totalCents: 29_840},
    {categoryId: 5, month: 7, totalCents: 380_000},
]);

export default function StyleguidePage(): React.ReactElement {
    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <LogoMark />
                    <span className="text-base font-semibold tracking-tight">
                        tagma
                    </span>
                    <span className="text-base text-muted-foreground">
                        / styleguide
                    </span>
                </div>
                <nav className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {SECTIONS.map(([id, label]) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            className="hover:text-foreground"
                        >
                            {label}
                        </a>
                    ))}
                    <Link href="/" className="hover:text-foreground">
                        ← app
                    </Link>
                    <ThemeToggle />
                </nav>
            </header>

            <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
                The visual baseline for tagma, rendered from the live tokens in{' '}
                <code>src/app/globals.css</code> and the real components. Rules
                and their reasons live in <code>DESIGN.md</code>.
            </p>

            <Section id="brand" title="brand">
                <div className="grid gap-3 md:grid-cols-2">
                    {(['light', 'dark'] as const).map(theme => (
                        <Bench key={theme} theme={theme}>
                            {[96, 48, 26, 16].map(size => (
                                <Image
                                    key={size}
                                    src="/logo.svg"
                                    alt={`logo at ${size}px`}
                                    width={size}
                                    height={size}
                                    unoptimized
                                    className="drop-shadow-[0_4px_8px_rgb(16_24_40/0.18)]"
                                />
                            ))}
                            <div className="ml-auto">
                                <div className="text-base font-semibold tracking-tight">
                                    tagma
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    income and expenses, kept in order
                                </div>
                            </div>
                        </Bench>
                    ))}
                </div>
                <Caption>
                    Carved-marble meander, <code>public/logo.svg</code>. The
                    only place colour appears outside meaning. 16px minimum.
                </Caption>
            </Section>

            <Section id="color" title="colour">
                <ColorTokens />
            </Section>

            <Section id="type" title="type">
                <div className="grid gap-1">
                    <div className="text-base">
                        Geist Mono · 0123456789 · 1.234,56 € · tabular, slashed
                        zero
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <span className="font-normal">400 regular</span>
                        <span className="font-medium">500 medium</span>
                        <span className="font-semibold">600 semibold</span>
                    </div>
                </div>
                <ul className="mt-4 divide-y divide-border/60 border-y">
                    {TYPE_SCALE.map(([token, px, role]) => (
                        <li
                            key={token}
                            className="grid grid-cols-[6rem_3rem_1fr] items-baseline gap-4 py-2.5 md:grid-cols-[6rem_3rem_1fr_18rem]"
                        >
                            <code className="text-xs">{token}</code>
                            <span className="text-xs text-muted-foreground">
                                {px}px
                            </span>
                            <span className={token}>
                                Put your finances in order
                            </span>
                            <span className="hidden text-xs text-muted-foreground md:block">
                                {role}
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 grid gap-1">
                    <span className="text-2xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        label · text-2xs, uppercase, tracking 0.18em
                    </span>
                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                        field label · text-xs, uppercase, tracking-wider
                    </span>
                    <span className="text-sm">
                        ui copy is lowercase: “new entry”, “add to Oktober”
                    </span>
                </div>
            </Section>

            <Section id="shape" title="shape & depth">
                <div className="flex flex-wrap gap-4">
                    {RADII.map(([cls, role]) => (
                        <div key={cls} className="grid gap-1.5">
                            <div
                                className={cn(cls, 'size-20 border bg-muted')}
                            />
                            <code className="text-xs">{cls}</code>
                            <span className="max-w-32 text-2xs text-muted-foreground">
                                {role}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Bench theme={null} className="h-36 justify-center">
                        <div className="grid h-20 w-48 place-items-center rounded-xl border bg-card text-xs text-muted-foreground shadow-float">
                            shadow-float
                        </div>
                    </Bench>
                    <Bench theme={null} className="h-36 justify-center">
                        <div className="grid h-20 w-48 place-items-center rounded-lg border bg-popover text-xs text-muted-foreground shadow-md">
                            shadow-md
                        </div>
                    </Bench>
                </div>
                <Caption>
                    The workbench is the floor; cards float on it with
                    shadow-float, menus with shadow-md. One spacing unit is
                    0.25rem = 3.25px at the 13px root; page gutters are px-4 and
                    sm:px-8.
                </Caption>
            </Section>

            <Section id="primitives" title="primitives">
                <div className="grid gap-8 lg:grid-cols-2">
                    <Buttons />
                    <Fields />
                </div>
                <div className="mt-8">
                    <Overlays />
                </div>
                <Caption>
                    shadcn primitives from <code>src/components/ui</code>,
                    unedited. Dialogs for focused tasks, the sheet (drawer) for
                    browsing next to the table, popovers for small settings.
                </Caption>
            </Section>

            <Section id="data" title="data">
                <div className="overflow-hidden rounded-xl border bg-card shadow-float">
                    <SheetHeader
                        sheet={SAMPLE_SHEET}
                        year={2026}
                        preferences={DEFAULT_PREFERENCES}
                    />
                    <YearSheetTable
                        sheet={SAMPLE_SHEET}
                        year={2026}
                        preferences={DEFAULT_PREFERENCES}
                        selectedMonth={9}
                        currentMonth={10}
                    />
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    {[
                        ['sheet cell', formatAmount(123456, 'de-DE')],
                        [
                            'single value',
                            formatMoney(123456, DEFAULT_PREFERENCES),
                        ],
                        ['empty cell', '·'],
                        ['signed net', '+1.655,14 / −312,00'],
                    ].map(([label, example]) => (
                        <div
                            key={label}
                            className="flex justify-between gap-4 border-b border-border/60 py-1.5"
                        >
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="tabular-nums">{example}</dd>
                        </div>
                    ))}
                </dl>
                <Caption>
                    The real sheet components with sample data. September is
                    selected (accent), October is current (highlight); July
                    shows a negative net.
                </Caption>
            </Section>
        </div>
    );
}

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

function Section({id, title, children}: SectionProps): React.ReactElement {
    return (
        <section
            id={id}
            className="scroll-mt-6 rounded-xl border bg-card p-5 shadow-float sm:p-6"
        >
            <h2 className="mb-4 text-2xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {title}
            </h2>
            {children}
        </section>
    );
}

interface BenchProps {
    /** null follows the page theme */
    theme: 'light' | 'dark' | null;
    className?: string;
    children: React.ReactNode;
}

function Bench({theme, className, children}: BenchProps): React.ReactElement {
    return (
        <div
            className={cn(
                theme,
                'flex items-center gap-5 rounded-lg border p-5 text-foreground',
                className,
            )}
            style={{
                backgroundColor: 'var(--workbench)',
                backgroundImage:
                    'radial-gradient(var(--pg-dot) 1px, transparent 0)',
                backgroundSize: '16px 16px',
            }}
        >
            {children}
        </div>
    );
}

function Caption({children}: {children: React.ReactNode}): React.ReactElement {
    return (
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {children}
        </p>
    );
}
