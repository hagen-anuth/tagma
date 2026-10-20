'use client';

import {PlusIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';

import {useEntryDialog} from './entry-dialog-provider';

export function NewEntryButton(): React.ReactElement {
    const {openNew} = useEntryDialog();
    return (
        <Button size="sm" onClick={() => openNew()}>
            <PlusIcon />
            new entry
            <kbd className="ml-1 hidden rounded sm:inline border border-primary-foreground/25 px-1 text-[10px] leading-4 opacity-70">
                N
            </kbd>
        </Button>
    );
}
