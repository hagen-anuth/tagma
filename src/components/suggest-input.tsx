'use client';

import {useEffect, useId, useRef, useState} from 'react';

import {cn} from '@/lib/utils';

import {Input} from '@/components/ui/input';

export interface SuggestOption {
    value: string;
    meta?: React.ReactNode;
}

interface SuggestInputProps extends Omit<
    React.ComponentProps<'input'>,
    'value' | 'onChange'
> {
    value: string;
    onValueChange: (value: string) => void;
    /** already narrowed to `value` by the caller */
    options: readonly SuggestOption[];
    onOptionSelect: (option: SuggestOption) => void;
}

/**
 * Free-text input with a suggestion list (ARIA combobox, list autocomplete).
 * Nothing is highlighted until an arrow key is pressed, so Enter on typed
 * text submits the form rather than taking a suggestion.
 *
 * Escape closes the list. An enclosing Radix dialog sees Escape first; it
 * should ignore it while `aria-expanded` is true on the focused element.
 */
export function SuggestInput({
    value,
    onValueChange,
    options,
    onOptionSelect,
    onFocus,
    onBlur,
    onKeyDown,
    className,
    ...inputProps
}: SuggestInputProps): React.ReactElement {
    const listId = useId();
    const listRef = useRef<HTMLUListElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const isOnlyExactMatch =
        options.length === 1 && options[0]?.value === value;
    const isShown = isOpen && options.length > 0 && !isOnlyExactMatch;
    const active = isShown && activeIndex < options.length ? activeIndex : -1;

    useEffect(() => {
        if (active === -1) return;
        listRef.current?.children[active]?.scrollIntoView({block: 'nearest'});
    }, [active]);

    function select(option: SuggestOption): void {
        onOptionSelect(option);
        setIsOpen(false);
        setActiveIndex(-1);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        // no defaultPrevented bail-out: the dialog's Escape guard prevents the
        // same native event, and the list must still close
        onKeyDown?.(event);
        const count = options.length;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isShown) {
                    setIsOpen(true);
                    setActiveIndex(0);
                } else {
                    setActiveIndex((active + 1) % count);
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isShown) {
                    setIsOpen(true);
                    setActiveIndex(count - 1);
                } else {
                    setActiveIndex(active <= 0 ? count - 1 : active - 1);
                }
                break;
            case 'Enter': {
                const option = options[active];
                if (isShown && option) {
                    event.preventDefault();
                    select(option);
                }
                break;
            }
            case 'Escape':
                if (isShown) {
                    setIsOpen(false);
                    setActiveIndex(-1);
                }
                break;
        }
    }

    return (
        <div className="relative">
            <Input
                {...inputProps}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isShown}
                aria-controls={listId}
                aria-activedescendant={
                    active === -1 ? undefined : `${listId}-${active}`
                }
                autoComplete="off"
                value={value}
                className={className}
                onChange={event => {
                    onValueChange(event.target.value);
                    setIsOpen(true);
                    setActiveIndex(-1);
                }}
                onFocus={event => {
                    onFocus?.(event);
                    setIsOpen(true);
                }}
                onBlur={event => {
                    onBlur?.(event);
                    setIsOpen(false);
                    setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
            />
            <ul
                ref={listRef}
                id={listId}
                role="listbox"
                hidden={!isShown}
                className="absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
            >
                {options.map((option, i) => (
                    <li
                        key={option.value}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        // keeps focus in the input, so blur does not close the list first
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => select(option)}
                        onMouseMove={() => setActiveIndex(i)}
                        className={cn(
                            'flex cursor-default items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-xs',
                            i === active && 'bg-muted',
                        )}
                    >
                        <span className="truncate">{option.value}</span>
                        {option.meta && (
                            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                {option.meta}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
