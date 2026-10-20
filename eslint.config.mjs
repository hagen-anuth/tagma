// @ts-check
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import {defineConfig, globalIgnores} from 'eslint/config';
import importX from 'eslint-plugin-import-x';

// eslint-config-next already registers react-hooks and typescript-eslint;
// redeclaring either plugin here is an error, so only their rules are set.
export default defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'coverage/**',
        'drizzle/**',
        'next-env.d.ts',
        'src/components/ui/**',
        'src/generated/**',
    ]),
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {'import-x': importX},
        settings: {'import-x/internal-regex': '^@/'},
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['..', '../*', '../**'],
                            message:
                                "Cross-directory imports use the '@/…' alias. A sibling './…' is fine.",
                        },
                    ],
                },
            ],

            'import/order': 'off',
            'import-x/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'type',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/lib/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/hooks/**',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    alphabetize: {order: 'asc', caseInsensitive: true},
                    'newlines-between': 'always',
                },
            ],

            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {fixStyle: 'inline-type-imports'},
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
            ],
        },
    },
]);
