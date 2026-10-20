'use client';

import {ChevronsUpDownIcon, PlusIcon} from 'lucide-react';
import {useRef, useState} from 'react';

import {cn} from '@/lib/utils';

import {Button} from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {
    CATEGORY_NAME_MAX,
    type Category,
    type CategoryChoice,
} from '@/schemas/entry';

interface CategoryComboboxProps {
    id?: string;
    categories: readonly Category[];
    value: CategoryChoice | null;
    onChange: (value: CategoryChoice) => void;
    /** takes over focus after a pick; otherwise it returns to the trigger */
    onAfterSelect?: () => void;
    isInvalid?: boolean;
}

export function CategoryCombobox({
    id,
    categories,
    value,
    onChange,
    onAfterSelect,
    isInvalid = false,
}: CategoryComboboxProps): React.ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const hasPickedRef = useRef(false);

    const query = search.trim().slice(0, CATEGORY_NAME_MAX);
    const hasExactMatch = categories.some(
        c => c.name.toLowerCase() === query.toLowerCase(),
    );
    const label = choiceLabel(value, categories);

    function select(choice: CategoryChoice): void {
        onChange(choice);
        hasPickedRef.current = true;
        setIsOpen(false);
        setSearch('');
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-invalid={isInvalid || undefined}
                    className="w-full justify-between font-normal"
                >
                    <span className={cn(!label && 'text-muted-foreground')}>
                        {label ?? 'pick or create…'}
                        {value && 'name' in value && (
                            <span className="ml-2 text-muted-foreground">
                                (new)
                            </span>
                        )}
                    </span>
                    <ChevronsUpDownIcon className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
                onCloseAutoFocus={event => {
                    if (hasPickedRef.current && onAfterSelect) {
                        event.preventDefault();
                        onAfterSelect();
                    }
                    hasPickedRef.current = false;
                }}
            >
                <Command>
                    <CommandInput
                        placeholder="search or type a new one"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>no categories yet</CommandEmpty>
                        <CommandGroup>
                            {categories.map(category => (
                                <CommandItem
                                    key={category.id}
                                    value={category.name}
                                    data-checked={
                                        value !== null &&
                                        'id' in value &&
                                        value.id === category.id
                                    }
                                    onSelect={() => select({id: category.id})}
                                >
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {query && !hasExactMatch && (
                            <CommandGroup forceMount>
                                <CommandItem
                                    forceMount
                                    value={`__create__${query}`}
                                    onSelect={() => select({name: query})}
                                >
                                    <PlusIcon />
                                    create “{query}”
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function choiceLabel(
    value: CategoryChoice | null,
    categories: readonly Category[],
): string | null {
    if (value === null) return null;
    if ('name' in value) return value.name;
    return categories.find(c => c.id === value.id)?.name ?? null;
}
