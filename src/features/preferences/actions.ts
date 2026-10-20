'use server';

import {refresh} from 'next/cache';
import {z} from 'zod';

import {type ActionResult} from '@/lib/action-result';
import {db} from '@/lib/db/client';
import {preferences} from '@/lib/db/schema';

import {PreferencesSchema} from '@/schemas/preferences';

export async function updatePreferences(input: unknown): Promise<ActionResult> {
    const parsed = PreferencesSchema.safeParse(input);
    if (!parsed.success) {
        return {ok: false, error: z.prettifyError(parsed.error)};
    }
    await db
        .insert(preferences)
        .values({id: 1, ...parsed.data})
        .onConflictDoUpdate({target: preferences.id, set: parsed.data});
    refresh();
    return {ok: true};
}
