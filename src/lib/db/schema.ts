import {sql} from 'drizzle-orm';
import {
    check,
    date,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core';

export const entryKind = pgEnum('entry_kind', ['income', 'expense']);

export const categories = pgTable(
    'categories',
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        name: varchar({length: 64}).notNull(),
        kind: entryKind().notNull(),
        sortOrder: integer().notNull().default(0),
        createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
    },
    table => [
        uniqueIndex('categories_kind_name_idx').on(
            table.kind,
            sql`lower(${table.name})`,
        ),
    ],
);

export const entries = pgTable(
    'entries',
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        name: varchar({length: 120}).notNull(),
        categoryId: integer()
            .notNull()
            .references(() => categories.id, {onDelete: 'restrict'}),
        // minor units of the preferences currency; always positive, the
        // category's kind carries the sign
        amountCents: integer().notNull(),
        occurredOn: date({mode: 'string'}).notNull(),
        createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
    },
    table => [
        index('entries_occurred_on_idx').on(table.occurredOn),
        check('entries_amount_positive', sql`${table.amountCents} > 0`),
    ],
);

/** Single row, id 1. */
export const preferences = pgTable(
    'preferences',
    {
        id: integer().primaryKey().default(1),
        currency: varchar({length: 3}).notNull().default('EUR'),
        locale: text().notNull().default('de-DE'),
    },
    table => [check('preferences_singleton', sql`${table.id} = 1`)],
);
