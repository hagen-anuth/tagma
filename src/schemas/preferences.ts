import {z} from 'zod';

// two-decimal currencies only: amounts are stored as cents
export const CURRENCIES = [
    'EUR',
    'USD',
    'GBP',
    'CHF',
    'SEK',
    'NOK',
    'DKK',
    'PLN',
    'CZK',
] as const;

export const LOCALES = [
    'de-DE',
    'de-AT',
    'de-CH',
    'en-GB',
    'en-US',
    'fr-FR',
    'es-ES',
    'it-IT',
    'nl-NL',
] as const;

export const PreferencesSchema = z.object({
    currency: z.enum(CURRENCIES),
    locale: z.enum(LOCALES),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const DEFAULT_PREFERENCES: Preferences = {
    currency: 'EUR',
    locale: 'de-DE',
};
