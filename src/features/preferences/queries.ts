import 'server-only';

import {eq} from 'drizzle-orm';

import {db} from '@/lib/db/client';
import {preferences} from '@/lib/db/schema';

import {
    DEFAULT_PREFERENCES,
    PreferencesSchema,
    type Preferences,
} from '@/schemas/preferences';

export async function getPreferences(): Promise<Preferences> {
    const [row] = await db
        .select({currency: preferences.currency, locale: preferences.locale})
        .from(preferences)
        .where(eq(preferences.id, 1));
    const parsed = PreferencesSchema.safeParse(row);
    return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
}
