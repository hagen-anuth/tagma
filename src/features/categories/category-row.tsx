'use client';

import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckIcon,
    PencilIcon,
    Trash2Icon,
    XIcon,
} from 'lucide-react';
import {useState} from 'react';

import {cn} from '@/lib/utils';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';
import {
    CATEGORY_NAME_MAX,
    ENTRY_KINDS,
    type Category,
    type CategoryInput,
    type EntryKind,
} from '@/schemas/entry';

interface CategoryRowProps {
    category: Category;
    entryCount: number;
    isFirst: boolean;
    isLast: boolean;
    isEditing: boolean;
    isPending: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: (input: CategoryInput) => void;
    onMove: (offset: number) => void;
    onDelete: () => void;
}

export function CategoryRow({
    category,
    entryCount,
    isFirst,
    isLast,
    isEditing,
    isPending,
    onEdit,
    onCancel,
    onSave,
    onMove,
    onDelete,
}: CategoryRowProps): React.ReactElement {
    if (isEditing) {
        return (
            <CategoryEditor
                category={category}
                entryCount={entryCount}
                isPending={isPending}
                onCancel={onCancel}
                onSave={onSave}
            />
        );
    }

    const isInUse = entryCount > 0;
    const deleteHint = isInUse
        ? `In use by ${formatCount(entryCount)}. Move or delete them first.`
        : `Delete ${category.name}`;

    return (
        <li className="group flex items-center gap-2 py-1 pr-1 pl-2">
            <span className="min-w-0 flex-1 truncate">{category.name}</span>
            <span
                className={cn(
                    'shrink-0 text-xs text-muted-foreground tabular-nums',
                    !isInUse && 'opacity-60',
                )}
            >
                {isInUse ? formatCount(entryCount) : 'unused'}
            </span>
            <div className="flex shrink-0 items-center opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${category.name} up`}
                    disabled={isPending || isFirst}
                    onClick={() => onMove(-1)}
                >
                    <ArrowUpIcon />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${category.name} down`}
                    disabled={isPending || isLast}
                    onClick={() => onMove(1)}
                >
                    <ArrowDownIcon />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${category.name}`}
                    disabled={isPending}
                    onClick={onEdit}
                >
                    <PencilIcon />
                </Button>
                {/* disabled buttons get no pointer events, so the span carries the hint */}
                <span title={deleteHint}>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={deleteHint}
                        disabled={isPending || isInUse}
                        onClick={onDelete}
                        className="hover:text-destructive"
                    >
                        <Trash2Icon />
                    </Button>
                </span>
            </div>
        </li>
    );
}

interface CategoryEditorProps {
    category: Category;
    entryCount: number;
    isPending: boolean;
    onCancel: () => void;
    onSave: (input: CategoryInput) => void;
}

function CategoryEditor({
    category,
    entryCount,
    isPending,
    onCancel,
    onSave,
}: CategoryEditorProps): React.ReactElement {
    const [name, setName] = useState(category.name);
    const [kind, setKind] = useState<EntryKind>(category.kind);
    const trimmed = name.trim();
    const isUnchanged = trimmed === category.name && kind === category.kind;

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        if (!trimmed) return;
        if (isUnchanged) onCancel();
        else onSave({name: trimmed, kind});
    }

    return (
        <li className="rounded-lg bg-muted/60 p-2">
            <form onSubmit={submit} className="grid gap-2">
                <div className="flex items-center gap-2">
                    <Input
                        autoFocus
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={CATEGORY_NAME_MAX}
                        aria-label="Category name"
                        className="h-7 flex-1 bg-background"
                    />
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="sm"
                        value={kind}
                        onValueChange={value => {
                            if (value === 'income' || value === 'expense') {
                                setKind(value);
                            }
                        }}
                        aria-label="Category type"
                        className="bg-background"
                    >
                        {ENTRY_KINDS.map(option => (
                            <ToggleGroupItem
                                key={option}
                                value={option}
                                className="text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                                {option}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <Button
                        type="submit"
                        size="icon-sm"
                        aria-label="Save category"
                        disabled={isPending || !trimmed}
                    >
                        <CheckIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Cancel editing"
                        onClick={onCancel}
                    >
                        <XIcon />
                    </Button>
                </div>
                {kind !== category.kind && entryCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Its {formatCount(entryCount)} will count as {kind}.
                    </p>
                )}
            </form>
        </li>
    );
}

function formatCount(total: number): string {
    return `${total} ${total === 1 ? 'entry' : 'entries'}`;
}
