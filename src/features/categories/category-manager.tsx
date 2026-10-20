'use client';

import {PlusIcon, TagsIcon} from 'lucide-react';
import {useState, useTransition} from 'react';

import {type ActionResult} from '@/lib/action-result';

import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {
    CATEGORY_NAME_MAX,
    ENTRY_KINDS,
    type Category,
    type EntryKind,
} from '@/schemas/entry';

import {
    createCategory,
    deleteCategory,
    reorderCategories,
    updateCategory,
} from './actions';
import {CategoryRow} from './category-row';
import {moveId} from './reorder';

const SECTION_LABELS: Record<EntryKind, string> = {
    income: 'income',
    expense: 'expenses',
};

interface CategoryManagerProps {
    categories: readonly Category[];
    entryCounts: Readonly<Record<number, number>>;
}

export function CategoryManager({
    categories,
    entryCounts,
}: CategoryManagerProps): React.ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function run(
        action: () => Promise<ActionResult>,
        onSuccess?: () => void,
    ): void {
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (result.ok) onSuccess?.();
            else setError(result.error);
        });
    }

    function changeOpen(next: boolean): void {
        setIsOpen(next);
        if (!next) {
            setEditingId(null);
            setError(null);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={changeOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Manage categories"
                >
                    <TagsIcon />
                    <span className="hidden sm:inline">categories</span>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-lg"
                onEscapeKeyDown={event => {
                    if (editingId === null) return;
                    event.preventDefault();
                    setEditingId(null);
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-base">categories</DialogTitle>
                    <DialogDescription className="text-xs">
                        Rename, reorder or switch a category between income and
                        expenses. A category can only be deleted once no entries
                        use it.
                    </DialogDescription>
                </DialogHeader>

                <div className="-mx-4 grid content-start gap-5 overflow-y-auto px-4 pb-1">
                    {ENTRY_KINDS.map(kind => {
                        const ofKind = categories.filter(c => c.kind === kind);
                        const ids = ofKind.map(c => c.id);
                        return (
                            <section key={kind} className="grid gap-1.5">
                                <h3 className="px-2 text-2xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                    {SECTION_LABELS[kind]}
                                </h3>
                                <ul className="divide-y divide-border/60 rounded-lg border">
                                    {ofKind.map((category, i) => (
                                        <CategoryRow
                                            key={category.id}
                                            category={category}
                                            entryCount={
                                                entryCounts[category.id] ?? 0
                                            }
                                            isFirst={i === 0}
                                            isLast={i === ofKind.length - 1}
                                            isEditing={
                                                editingId === category.id
                                            }
                                            isPending={isPending}
                                            onEdit={() => {
                                                setError(null);
                                                setEditingId(category.id);
                                            }}
                                            onCancel={() => setEditingId(null)}
                                            onSave={input =>
                                                run(
                                                    () =>
                                                        updateCategory(
                                                            category.id,
                                                            input,
                                                        ),
                                                    () => setEditingId(null),
                                                )
                                            }
                                            onMove={offset => {
                                                const next = moveId(
                                                    ids,
                                                    category.id,
                                                    offset,
                                                );
                                                if (next) {
                                                    run(() =>
                                                        reorderCategories({
                                                            kind,
                                                            ids: next,
                                                        }),
                                                    );
                                                }
                                            }}
                                            onDelete={() =>
                                                run(() =>
                                                    deleteCategory(category.id),
                                                )
                                            }
                                        />
                                    ))}
                                    {ofKind.length === 0 && (
                                        <li className="px-2 py-2 text-xs text-muted-foreground">
                                            none yet
                                        </li>
                                    )}
                                </ul>
                                <AddCategory
                                    kind={kind}
                                    isPending={isPending}
                                    onAdd={(name, onDone) =>
                                        run(
                                            () => createCategory({name, kind}),
                                            onDone,
                                        )
                                    }
                                />
                            </section>
                        );
                    })}
                </div>

                <p
                    role="alert"
                    className="min-h-4 text-xs text-destructive empty:hidden"
                >
                    {error}
                </p>
            </DialogContent>
        </Dialog>
    );
}

interface AddCategoryProps {
    kind: EntryKind;
    isPending: boolean;
    onAdd: (name: string, onDone: () => void) => void;
}

function AddCategory({
    kind,
    isPending,
    onAdd,
}: AddCategoryProps): React.ReactElement {
    const [name, setName] = useState('');
    const trimmed = name.trim();

    return (
        <form
            className="flex gap-2"
            onSubmit={event => {
                event.preventDefault();
                if (trimmed) onAdd(trimmed, () => setName(''));
            }}
        >
            <Input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={CATEGORY_NAME_MAX}
                placeholder={`new ${kind} category`}
                aria-label={`New ${kind} category`}
                className="h-7 flex-1"
            />
            <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isPending || !trimmed}
            >
                <PlusIcon />
                add
            </Button>
        </form>
    );
}
