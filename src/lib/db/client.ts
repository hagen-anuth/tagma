import 'server-only';

import {drizzle, type NodePgDatabase} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import * as schema from './schema';

type Database = NodePgDatabase<typeof schema>;

// dev hot reload re-evaluates this module; keep one pool per process
const globalForDb = globalThis as unknown as {tagmaDb?: Database};

function createDb(): Database {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set — copy .env.example to .env');
    }
    return drizzle(new Pool({connectionString: url}), {
        schema,
        casing: 'snake_case',
    });
}

export const db: Database = globalForDb.tagmaDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
    globalForDb.tagmaDb = db;
}
