'use client';

import {createContext, useContext, useEffect, useMemo, useState} from 'react';

import {todayIso} from '@/lib/dates';
import {formatAmountInput} from '@/lib/money';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {EntryForm, type EntryFormValues} from './entry-form';

import type {NameSuggestionsByCategory} from './name-suggestions';
import type {Category, Entry} from '@/schemas/entry';
import type {Preferences} from '@/schemas/preferences';

interface NewEntryDefaults {
    occurredOn?: string;
    categoryId?: number;
}

interface EntryDialogApi {
    openNew: (defaults?: NewEntryDefaults) => void;
    openEdit: (entry: Entry) => void;
}

interface DialogState {
    isOpen: boolean;
    entryId: number | null;
    values: EntryFormValues;
    /** remounts the form, so each opening starts from its own defaults */
    session: number;
}

const EntryDialogContext = createContext<EntryDialogApi | null>(null);

export function useEntryDialog(): EntryDialogApi {
    const api = useContext(EntryDialogContext);
    if (!api) {
        throw new Error(
            'useEntryDialog must be used within EntryDialogProvider',
        );
    }
    return api;
}

interface EntryDialogProviderProps {
    categories: readonly Category[];
    nameSuggestions: NameSuggestionsByCategory;
    preferences: Preferences;
    children: React.ReactNode;
}

export function EntryDialogProvider({
    categories,
    nameSuggestions,
    preferences,
    children,
}: EntryDialogProviderProps): React.ReactElement {
    const [state, setState] = useState<DialogState>(() => ({
        isOpen: false,
        entryId: null,
        values: blankValues(),
        session: 0,
    }));

    const api = useMemo<EntryDialogApi>(
        () => ({
            openNew: (defaults = {}) => {
                const category = categories.find(
                    c => c.id === defaults.categoryId,
                );
                setState(prev => ({
                    isOpen: true,
                    entryId: null,
                    values: {
                        ...blankValues(),
                        kind: category?.kind ?? 'expense',
                        category: category ? {id: category.id} : null,
                        occurredOn: defaults.occurredOn ?? todayIso(),
                    },
                    session: prev.session + 1,
                }));
            },
            openEdit: entry => {
                setState(prev => ({
                    isOpen: true,
                    entryId: entry.id,
                    values: {
                        kind: entry.kind,
                        name: entry.name,
                        category: {id: entry.categoryId},
                        amount: formatAmountInput(
                            entry.amountCents,
                            preferences.locale,
                        ),
                        occurredOn: entry.occurredOn,
                    },
                    session: prev.session + 1,
                }));
            },
        }),
        [categories, preferences.locale],
    );

    useNewEntryShortcut(state.isOpen, api.openNew);

    function close(): void {
        setState(prev => ({...prev, isOpen: false}));
    }

    return (
        <EntryDialogContext.Provider value={api}>
            {children}
            <Dialog
                open={state.isOpen}
                onOpenChange={isOpen => {
                    if (!isOpen) close();
                }}
            >
                <DialogContent
                    className="sm:max-w-md"
                    onEscapeKeyDown={event => {
                        // the name field's suggestion list closes first
                        const focused = document.activeElement;
                        if (focused?.getAttribute('aria-expanded') === 'true') {
                            event.preventDefault();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-base">
                            {state.entryId === null
                                ? 'new entry'
                                : 'edit entry'}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Income or expense with name, category, amount and
                            date.
                        </DialogDescription>
                    </DialogHeader>
                    <EntryForm
                        key={state.session}
                        entryId={state.entryId}
                        defaultValues={state.values}
                        categories={categories}
                        nameSuggestions={nameSuggestions}
                        preferences={preferences}
                        onDone={close}
                    />
                </DialogContent>
            </Dialog>
        </EntryDialogContext.Provider>
    );
}

function blankValues(): EntryFormValues {
    return {
        kind: 'expense',
        name: '',
        category: null,
        amount: '',
        occurredOn: todayIso(),
    };
}

/** `n` opens a new entry, unless focus is in a field or a dialog is open. */
function useNewEntryShortcut(isOpen: boolean, openNew: () => void): void {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent): void {
            if (isOpen || event.key !== 'n') return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            const target = event.target as HTMLElement | null;
            if (
                target?.closest('input, textarea, select, [contenteditable]') ||
                document.querySelector('[role="dialog"]')
            ) {
                return;
            }
            event.preventDefault();
            openNew();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, openNew]);
}
