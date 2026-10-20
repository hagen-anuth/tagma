'use server';

import {and, eq, sql} from 'drizzle-orm';
import {refresh} from 'next/cache';
import {z} from 'zod';

import {type ActionResult} from '@/lib/action-result';
import {db} from '@/lib/db/client';
import {categories, entries} from '@/lib/db/schema';

import {
    EntryInputSchema,
    type CategoryChoice,
    type EntryKind,
} from '@/schemas/entry';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function saveEntry(input: unknown): Promise<ActionResult> {
    const parsed = EntryInputSchema.safeParse(input);
    if (!parsed.success) {
        return {ok: false, error: z.prettifyError(parsed.error)};
    }
    const {id, kind, name, category, amountCents, occurredOn} = parsed.data;

    const result = await db.transaction(async tx => {
        const categoryId = await resolveCategory(tx, kind, category);
        if (categoryId === null) {
            return {ok: false, error: 'Unknown category'} as const;
        }
        const values = {name, categoryId, amountCents, occurredOn};
        if (id === undefined) {
            await tx.insert(entries).values(values);
            return {ok: true} as const;
        }
        const updated = await tx
            .update(entries)
            .set(values)
            .where(eq(entries.id, id))
            .returning({id: entries.id});
        return updated.length > 0
            ? ({ok: true} as const)
            : ({ok: false, error: 'Entry no longer exists'} as const);
    });

    if (result.ok) refresh();
    return result;
}

export async function deleteEntry(id: number): Promise<ActionResult> {
    if (!Number.isInteger(id) || id <= 0) {
        return {ok: false, error: 'Invalid id'};
    }
    await db.delete(entries).where(eq(entries.id, id));
    refresh();
    return {ok: true};
}

/** Returns null when an id is given that does not exist for this kind. */
async function resolveCategory(
    tx: Transaction,
    kind: EntryKind,
    choice: CategoryChoice,
): Promise<number | null> {
    if ('id' in choice) {
        const [row] = await tx
            .select({id: categories.id})
            .from(categories)
            .where(
                and(eq(categories.id, choice.id), eq(categories.kind, kind)),
            );
        return row?.id ?? null;
    }

    // a concurrent or case-different duplicate resolves to the existing row
    await tx
        .insert(categories)
        .values({
            name: choice.name,
            kind,
            sortOrder: sql`(select coalesce(max(${categories.sortOrder}), 0) + 10 from ${categories} where ${categories.kind} = ${kind})`,
        })
        .onConflictDoNothing();
    const [row] = await tx
        .select({id: categories.id})
        .from(categories)
        .where(
            and(
                eq(categories.kind, kind),
                sql`lower(${categories.name}) = lower(${choice.name})`,
            ),
        );
    return row?.id ?? null;
}
