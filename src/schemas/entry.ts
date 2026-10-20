import {z} from 'zod';

/** Upper bound for one entry, in cents; keeps sums far from the int column limit. */
export const MAX_AMOUNT_CENTS = 1_000_000_00;

export const ENTRY_KINDS = ['income', 'expense'] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const CATEGORY_NAME_MAX = 64;

/** An existing category by id, or a new one created on save. */
export const CategoryChoiceSchema = z.union([
    z.object({id: z.number().int().positive()}),
    z.object({name: z.string().trim().min(1).max(CATEGORY_NAME_MAX)}),
]);
export type CategoryChoice = z.infer<typeof CategoryChoiceSchema>;

export const CategoryInputSchema = z.object({
    name: z.string().trim().min(1).max(CATEGORY_NAME_MAX),
    kind: z.enum(ENTRY_KINDS),
});
export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export const EntryInputSchema = z.object({
    id: z.number().int().positive().optional(),
    kind: z.enum(ENTRY_KINDS),
    name: z.string().trim().min(1).max(120),
    category: CategoryChoiceSchema,
    amountCents: z.number().int().positive().max(MAX_AMOUNT_CENTS),
    occurredOn: z.iso.date(),
});
export type EntryInput = z.infer<typeof EntryInputSchema>;

export interface Category {
    id: number;
    name: string;
    kind: EntryKind;
    sortOrder: number;
}

export interface Entry {
    id: number;
    name: string;
    categoryId: number;
    categoryName: string;
    kind: EntryKind;
    amountCents: number;
    occurredOn: string;
}
