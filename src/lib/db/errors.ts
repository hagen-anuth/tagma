export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';

/** SQLSTATE of a pg error, whether thrown directly or wrapped by Drizzle as `cause`. */
export function pgErrorCode(error: unknown): string | null {
    for (let e = error, depth = 0; e && depth < 3; depth++) {
        if (
            typeof e === 'object' &&
            'code' in e &&
            typeof e.code === 'string'
        ) {
            return e.code;
        }
        e = typeof e === 'object' && 'cause' in e ? e.cause : null;
    }
    return null;
}
