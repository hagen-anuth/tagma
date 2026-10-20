import 'server-only';

import {asc, count} from 'drizzle-orm';

import {db} from '@/lib/db/client';
import {categories, entries} from '@/lib/db/schema';

import type {Category} from '@/schemas/entry';

export async function getCategories(): Promise<Category[]> {
    return db
        .select({
            id: categories.id,
            name: categories.name,
            kind: categories.kind,
            sortOrder: categories.sortOrder,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name));
}

/** All-time entry count per category id; categories without entries are absent. */
export async function getCategoryEntryCounts(): Promise<
    Record<number, number>
> {
    const rows = await db
        .select({categoryId: entries.categoryId, total: count()})
        .from(entries)
        .groupBy(entries.categoryId);
    return Object.fromEntries(rows.map(row => [row.categoryId, row.total]));
}
