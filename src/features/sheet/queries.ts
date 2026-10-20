import 'server-only';

import {and, desc, eq, gte, lt, sql} from 'drizzle-orm';

import {monthRange, yearRange} from '@/lib/dates';
import {db} from '@/lib/db/client';
import {categories, entries} from '@/lib/db/schema';

import type {MonthlyTotal} from './build-year-sheet';
import type {Entry} from '@/schemas/entry';

export async function getMonthlyTotals(year: number): Promise<MonthlyTotal[]> {
    const [from, to] = yearRange(year);
    const month = sql<number>`extract(month from ${entries.occurredOn})::int`;
    return db
        .select({
            categoryId: entries.categoryId,
            month,
            totalCents: sql<number>`sum(${entries.amountCents})`.mapWith(
                Number,
            ),
        })
        .from(entries)
        .where(and(gte(entries.occurredOn, from), lt(entries.occurredOn, to)))
        .groupBy(entries.categoryId, month);
}

export async function getMonthEntries(
    year: number,
    month: number,
): Promise<Entry[]> {
    const [from, to] = monthRange(year, month);
    return db
        .select({
            id: entries.id,
            name: entries.name,
            categoryId: entries.categoryId,
            categoryName: categories.name,
            kind: categories.kind,
            amountCents: entries.amountCents,
            occurredOn: entries.occurredOn,
        })
        .from(entries)
        .innerJoin(categories, eq(entries.categoryId, categories.id))
        .where(and(gte(entries.occurredOn, from), lt(entries.occurredOn, to)))
        .orderBy(desc(entries.occurredOn), desc(entries.id));
}
