import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vitest/config';

// date logic reads the local calendar; pin it so results do not depend on the host
process.env.TZ = 'Europe/Berlin';

export default defineConfig({
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
