'use server';

import {and, count, eq, sql} from 'drizzle-orm';
import {refresh} from 'next/cache';
import {z} from 'zod';

import {type ActionResult} from '@/lib/action-result';
import {db} from '@/lib/db/client';
import {
    PG_FOREIGN_KEY_VIOLATION,
    PG_UNIQUE_VIOLATION,
    pgErrorCode,
} from '@/lib/db/errors';
import {categories, entries} from '@/lib/db/schema';

import {
    CategoryInputSchema,
    ENTRY_KINDS,
    type EntryKind,
} from '@/schemas/entry';

import {sortOrdersFor} from './reorder';

const IdSchema = z.number().int().positive();

const ReorderSchema = z.object({
    kind: z.enum(ENTRY_KINDS),
    ids: z.array(IdSchema),
});

export async function createCategory(input: unknown): Promise<ActionResult> {
    const parsed = CategoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return {ok: false, error: z.prettifyError(parsed.error)};
    }
    const {name, kind} = parsed.data;
    try {
        await db
            .insert(categories)
            .values({name, kind, sortOrder: nextSortOrder(kind)});
    } catch (error) {
        return failure(error, name, kind);
    }
    refresh();
    return {ok: true};
}

/** A kind change moves the category, and so all its entries, to the other side of the sheet. */
export async function updateCategory(
    id: unknown,
    input: unknown,
): Promise<ActionResult> {
    const parsedId = IdSchema.safeParse(id);
    const parsed = CategoryInputSchema.safeParse(input);
    if (!parsedId.success || !parsed.success) {
        return {
            ok: false,
            error: parsed.success
                ? 'Invalid id'
                : z.prettifyError(parsed.error),
        };
    }
    const {name, kind} = parsed.data;
    try {
        const [current] = await db
            .select({kind: categories.kind})
            .from(categories)
            .where(eq(categories.id, parsedId.data));
        if (!current) return {ok: false, error: 'Category no longer exists'};

        await db
            .update(categories)
            .set({
                name,
                kind,
                ...(current.kind === kind
                    ? {}
                    : {sortOrder: nextSortOrder(kind)}),
            })
            .where(eq(categories.id, parsedId.data));
    } catch (error) {
        return failure(error, name, kind);
    }
    refresh();
    return {ok: true};
}

/** `ids` must be every category of `kind`, in the new order. */
export async function reorderCategories(input: unknown): Promise<ActionResult> {
    const parsed = ReorderSchema.safeParse(input);
    if (!parsed.success) {
        return {ok: false, error: z.prettifyError(parsed.error)};
    }
    const {kind, ids} = parsed.data;

    const result = await db.transaction(async tx => {
        const existing = await tx
            .select({id: categories.id})
            .from(categories)
            .where(eq(categories.kind, kind));
        const isSameSet =
            existing.length === ids.length &&
            existing.every(row => ids.includes(row.id));
        if (!isSameSet) {
            refresh();
            return {
                ok: false,
                error: 'Categories changed meanwhile; try again',
            } as const;
        }
        for (const [id, sortOrder] of sortOrdersFor(ids)) {
            await tx
                .update(categories)
                .set({sortOrder})
                .where(and(eq(categories.id, id), eq(categories.kind, kind)));
        }
        return {ok: true} as const;
    });

    if (result.ok) refresh();
    return result;
}

export async function deleteCategory(id: unknown): Promise<ActionResult> {
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) return {ok: false, error: 'Invalid id'};

    const [usage] = await db
        .select({total: count()})
        .from(entries)
        .where(eq(entries.categoryId, parsedId.data));
    if (usage && usage.total > 0) return inUse(usage.total);

    try {
        await db.delete(categories).where(eq(categories.id, parsedId.data));
    } catch (error) {
        // an entry was added between the count and the delete
        if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) return inUse(1);
        throw error;
    }
    refresh();
    return {ok: true};
}

function nextSortOrder(kind: EntryKind) {
    return sql`(select coalesce(max(${categories.sortOrder}), 0) + 10 from ${categories} where ${categories.kind} = ${kind})`;
}

function failure(error: unknown, name: string, kind: EntryKind): ActionResult {
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
        return {
            ok: false,
            error: `There is already an ${kind} category called “${name}”`,
        };
    }
    throw error;
}

/** Refreshes too: the caller showed the category as unused, so its counts are stale. */
function inUse(total: number): ActionResult {
    refresh();
    return {
        ok: false,
        error: `Still used by ${total} ${total === 1 ? 'entry' : 'entries'}. Move ${total === 1 ? 'it' : 'them'} to another category or delete ${total === 1 ? 'it' : 'them'} first.`,
    };
}
