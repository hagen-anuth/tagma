'use client';

import {Settings2Icon} from 'lucide-react';
import {useState, useTransition} from 'react';

import {formatMoney} from '@/lib/money';

import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {CURRENCIES, LOCALES, type Preferences} from '@/schemas/preferences';

import {updatePreferences} from './actions';

const SAMPLE_CENTS = 123456;

interface PreferencesPopoverProps {
    preferences: Preferences;
}

export function PreferencesPopover({
    preferences,
}: PreferencesPopoverProps): React.ReactElement {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function update(patch: Partial<Preferences>): void {
        setError(null);
        startTransition(async () => {
            const result = await updatePreferences({...preferences, ...patch});
            if (!result.ok) setError(result.error);
        });
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Preferences">
                    <Settings2Icon />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="grid w-64 gap-3 text-xs">
                <div className="grid gap-1.5">
                    <Label className="text-[11px] tracking-wider text-muted-foreground uppercase">
                        currency
                    </Label>
                    <Select
                        value={preferences.currency}
                        onValueChange={value =>
                            update({currency: value as Preferences['currency']})
                        }
                        disabled={isPending}
                    >
                        <SelectTrigger size="sm" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map(currency => (
                                <SelectItem key={currency} value={currency}>
                                    {currency}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-[11px] tracking-wider text-muted-foreground uppercase">
                        number &amp; date format
                    </Label>
                    <Select
                        value={preferences.locale}
                        onValueChange={value =>
                            update({locale: value as Preferences['locale']})
                        }
                        disabled={isPending}
                    >
                        <SelectTrigger size="sm" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCALES.map(locale => (
                                <SelectItem key={locale} value={locale}>
                                    {locale}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-muted-foreground">
                    e.g. {formatMoney(SAMPLE_CENTS, preferences)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                    Changing the currency relabels amounts; it does not convert
                    them.
                </p>
                {error && (
                    <p role="alert" className="text-destructive">
                        {error}
                    </p>
                )}
            </PopoverContent>
        </Popover>
    );
}
