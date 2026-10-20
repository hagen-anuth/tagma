import {loadEnvConfig} from '@next/env';
import {defineConfig} from 'drizzle-kit';

// drizzle-kit runs outside Next, so .env is loaded the same way Next loads it
loadEnvConfig(process.cwd());

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    casing: 'snake_case',
    dbCredentials: {url: process.env.DATABASE_URL ?? ''},
    strict: true,
});
