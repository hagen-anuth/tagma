'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {Trash2Icon} from 'lucide-react';
import {useMemo, useTransition} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {z} from 'zod';

import {formatAmountInput, formatMoney, parseAmount} from '@/lib/money';
import {cn} from '@/lib/utils';

import {SuggestInput, type SuggestOption} from '@/components/suggest-input';
import {Button} from '@/components/ui/button';
import {DialogFooter} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {Label} from '@/components/ui/label';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';
import {deleteEntry, saveEntry} from '@/features/entries/actions';
import {
    CategoryChoiceSchema,
    ENTRY_KINDS,
    type Category,
    type EntryKind,
} from '@/schemas/entry';

import {CategoryCombobox} from './category-combobox';
import {
    findCanonicalName,
    normalizeName,
    rankSuggestions,
    type NameSuggestionsByCategory,
} from './name-suggestions';

import type {Preferences} from '@/schemas/preferences';

function createFormSchema(locale: string) {
    return z.object({
        kind: z.enum(ENTRY_KINDS),
        name: z.string().trim().min(1, 'required').max(120),
        category: CategoryChoiceSchema.nullable().refine(v => v !== null, {
            message: 'required',
        }),
        amount: z.string().refine(v => parseAmount(v, locale) !== null, {
            message: 'enter a positive amount, e.g. 12,50',
        }),
        occurredOn: z.iso.date('required'),
    });
}

export type EntryFormValues = z.input<ReturnType<typeof createFormSchema>>;

interface EntryFormProps {
    entryId: number | null;
    defaultValues: EntryFormValues;
    categories: readonly Category[];
    nameSuggestions: NameSuggestionsByCategory;
    preferences: Preferences;
    onDone: () => void;
}

export function EntryForm({
    entryId,
    defaultValues,
    categories,
    nameSuggestions,
    preferences,
    onDone,
}: EntryFormProps): React.ReactElement {
    const schema = useMemo(
        () => createFormSchema(preferences.locale),
        [preferences.locale],
    );
    const {
        register,
        control,
        handleSubmit,
        getValues,
        setFocus,
        setValue,
        setError,
        formState: {errors},
    } = useForm<EntryFormValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });
    const [isPending, startTransition] = useTransition();

    const kind = useWatch({control, name: 'kind'});
    const kindCategories = categories.filter(c => c.kind === kind);
    const category = useWatch({control, name: 'category'});
    const name = useWatch({control, name: 'name'});

    const knownNames =
        category !== null && 'id' in category
            ? (nameSuggestions[category.id] ?? [])
            : [];
    const canonicalName = findCanonicalName(knownNames, name);
    const nameOptions: SuggestOption[] = rankSuggestions(knownNames, name).map(
        s => ({
            value: s.name,
            meta: `${s.uses}× · ${formatMoney(s.lastAmountCents, preferences)}`,
        }),
    );

    function pickName(option: SuggestOption): void {
        setValue('name', option.value, {shouldValidate: true});
        const known = knownNames.find(s => s.name === option.value);
        // recurring entries usually repeat their amount; never overwrite one
        if (known && entryId === null && !getValues('amount').trim()) {
            setValue(
                'amount',
                formatAmountInput(known.lastAmountCents, preferences.locale),
            );
        }
        setFocus('amount', {shouldSelect: true});
    }

    function changeKind(next: EntryKind): void {
        setValue('kind', next);
        const category = getValues('category');
        const isOtherKind =
            category !== null &&
            'id' in category &&
            !categories.some(c => c.id === category.id && c.kind === next);
        if (isOtherKind) setValue('category', null);
    }

    const submit = handleSubmit(values => {
        const amountCents = parseAmount(values.amount, preferences.locale);
        if (amountCents === null || values.category === null) return;
        startTransition(async () => {
            const result = await saveEntry({
                ...(entryId === null ? {} : {id: entryId}),
                kind: values.kind,
                name: canonicalName ?? normalizeName(values.name),
                category: values.category,
                amountCents,
                occurredOn: values.occurredOn,
            });
            if (result.ok) onDone();
            else setError('root', {message: result.error});
        });
    });

    function remove(): void {
        if (entryId === null) return;
        startTransition(async () => {
            const result = await deleteEntry(entryId);
            if (result.ok) onDone();
            else setError('root', {message: result.error});
        });
    }

    return (
        <form onSubmit={submit} className="grid gap-4" noValidate>
            <Controller
                control={control}
                name="kind"
                render={({field}) => (
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="sm"
                        value={field.value}
                        onValueChange={value => {
                            if (value === 'income' || value === 'expense') {
                                changeKind(value);
                            }
                        }}
                        className="w-full"
                        aria-label="Entry type"
                    >
                        <ToggleGroupItem value="expense" className="flex-1">
                            expense
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="income"
                            className="flex-1 data-[state=on]:text-positive"
                        >
                            income
                        </ToggleGroupItem>
                    </ToggleGroup>
                )}
            />

            <Field
                label="category"
                htmlFor="entry-category"
                error={errors.category?.message}
            >
                <Controller
                    control={control}
                    name="category"
                    render={({field}) => (
                        <CategoryCombobox
                            id="entry-category"
                            categories={kindCategories}
                            value={field.value}
                            onChange={field.onChange}
                            onAfterSelect={() => setFocus('name')}
                            isInvalid={Boolean(errors.category)}
                        />
                    )}
                />
            </Field>

            <Field
                label="name"
                htmlFor="entry-name"
                error={errors.name?.message}
                hint={
                    canonicalName
                        ? `saved as “${canonicalName}”, matching earlier entries`
                        : undefined
                }
            >
                <Controller
                    control={control}
                    name="name"
                    render={({field}) => (
                        <SuggestInput
                            id="entry-name"
                            ref={field.ref}
                            value={field.value}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={nameOptions}
                            onOptionSelect={pickName}
                            disabled={category === null}
                            placeholder={
                                category === null
                                    ? 'pick a category first'
                                    : knownNames.length > 0
                                      ? 'type or pick from earlier entries'
                                      : kind === 'income'
                                        ? 'e.g. salary'
                                        : 'e.g. supermarket'
                            }
                            aria-invalid={Boolean(errors.name) || undefined}
                        />
                    )}
                />
            </Field>

            <div className="grid grid-cols-[1fr_auto] gap-3">
                <Field
                    label="amount"
                    htmlFor="entry-amount"
                    error={errors.amount?.message}
                >
                    <InputGroup>
                        <InputGroupInput
                            id="entry-amount"
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0,00"
                            className="text-right tabular-nums"
                            aria-invalid={Boolean(errors.amount) || undefined}
                            {...register('amount')}
                        />
                        <InputGroupAddon align="inline-end">
                            {preferences.currency}
                        </InputGroupAddon>
                    </InputGroup>
                </Field>
                <Field
                    label="date"
                    htmlFor="entry-date"
                    error={errors.occurredOn?.message}
                >
                    <Input
                        id="entry-date"
                        type="date"
                        className="w-36"
                        aria-invalid={Boolean(errors.occurredOn) || undefined}
                        {...register('occurredOn')}
                    />
                </Field>
            </div>

            {errors.root?.message && (
                <p role="alert" className="text-xs text-destructive">
                    {errors.root.message}
                </p>
            )}

            <DialogFooter className="items-center sm:justify-between">
                {entryId === null ? (
                    <span className="hidden text-xs text-muted-foreground sm:block">
                        ↵ to save
                    </span>
                ) : (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={remove}
                        disabled={isPending}
                    >
                        <Trash2Icon />
                        delete
                    </Button>
                )}
                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? 'saving…'
                        : entryId === null
                          ? 'add entry'
                          : 'save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

interface FieldProps {
    label: string;
    htmlFor: string;
    error: string | undefined;
    hint?: string | undefined;
    children: React.ReactNode;
}

function Field({
    label,
    htmlFor,
    error,
    hint,
    children,
}: FieldProps): React.ReactElement {
    return (
        <div className="grid gap-1.5">
            <Label
                htmlFor={htmlFor}
                className="text-[11px] tracking-wider text-muted-foreground uppercase"
            >
                {label}
            </Label>
            {children}
            <p
                className={cn(
                    'min-h-0 text-[11px] text-destructive',
                    !error && 'hidden',
                )}
            >
                {error}
            </p>
            {hint && !error && (
                <p className="text-[11px] text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}
