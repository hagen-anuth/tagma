import 'server-only';

import {sql} from 'drizzle-orm';

import {db} from '@/lib/db/client';
import {entries} from '@/lib/db/schema';

import type {
    NameSuggestion,
    NameSuggestionsByCategory,
} from './name-suggestions';

/** Every distinct entry name per category, across all years. */
export async function getNameSuggestions(): Promise<NameSuggestionsByCategory> {
    const rows = await db
        .select({
            categoryId: entries.categoryId,
            name: entries.name,
            uses: sql<number>`count(*)::int`,
            lastUsedOn: sql<string>`max(${entries.occurredOn})::text`,
            lastAmountCents: sql<number>`(array_agg(${entries.amountCents} order by ${entries.occurredOn} desc, ${entries.id} desc))[1]`,
        })
        .from(entries)
        .groupBy(entries.categoryId, entries.name)
        .orderBy(
            sql`count(*) desc`,
            sql`max(${entries.occurredOn}) desc`,
            entries.name,
        );

    const byCategory: Record<number, NameSuggestion[]> = {};
    for (const {categoryId, ...suggestion} of rows) {
        (byCategory[categoryId] ??= []).push(suggestion);
    }
    return byCategory;
}
