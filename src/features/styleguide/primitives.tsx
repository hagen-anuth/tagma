'use client';

import {PlusIcon, Settings2Icon, Trash2Icon} from 'lucide-react';
import {useState} from 'react';

import {SuggestInput} from '@/components/suggest-input';
import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {Label} from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';

const VARIANTS = [
    'default',
    'outline',
    'secondary',
    'ghost',
    'destructive',
    'link',
] as const;

const SIZES = ['xs', 'sm', 'default', 'lg'] as const;

const SAMPLE_NAMES = [
    'health insurance',
    'liability insurance',
    'dental health',
    'gym',
];

export function Buttons(): React.ReactElement {
    return (
        <div className="grid content-start gap-4">
            <Specimen label="variants · size sm">
                {VARIANTS.map(variant => (
                    <Button key={variant} variant={variant} size="sm">
                        {variant}
                    </Button>
                ))}
            </Specimen>
            <Specimen label="sizes · default variant">
                {SIZES.map(size => (
                    <Button key={size} size={size}>
                        <PlusIcon />
                        {size}
                    </Button>
                ))}
            </Specimen>
            <Specimen label="icon buttons · ghost">
                <Button variant="ghost" size="icon-xs" aria-label="xs">
                    <Trash2Icon />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="sm">
                    <Settings2Icon />
                </Button>
                <Button variant="ghost" size="icon" aria-label="default">
                    <Settings2Icon />
                </Button>
            </Specimen>
            <Specimen label="disabled">
                <Button size="sm" disabled>
                    add entry
                </Button>
                <Button size="sm" variant="outline" disabled>
                    add
                </Button>
            </Specimen>
        </div>
    );
}

export function Fields(): React.ReactElement {
    const [kind, setKind] = useState('expense');
    const [name, setName] = useState('');
    const options = SAMPLE_NAMES.filter(n =>
        n.includes(name.trim().toLowerCase()),
    ).map(value => ({value, meta: '3× · 91,50 €'}));

    return (
        <div className="grid max-w-md gap-4">
            <FieldDemo label="text input" htmlFor="sg-input">
                <Input id="sg-input" placeholder="placeholder" />
            </FieldDemo>
            <FieldDemo label="invalid" htmlFor="sg-invalid">
                <Input id="sg-invalid" aria-invalid defaultValue="12,345" />
                <p className="text-xs text-destructive">
                    enter a positive amount, e.g. 12,50
                </p>
            </FieldDemo>
            <FieldDemo label="disabled" htmlFor="sg-disabled">
                <Input
                    id="sg-disabled"
                    disabled
                    placeholder="pick a category first"
                />
            </FieldDemo>
            <FieldDemo label="amount (input group)" htmlFor="sg-amount">
                <InputGroup>
                    <InputGroupInput
                        id="sg-amount"
                        inputMode="decimal"
                        placeholder="0,00"
                        className="text-right tabular-nums"
                    />
                    <InputGroupAddon align="inline-end">EUR</InputGroupAddon>
                </InputGroup>
            </FieldDemo>
            <FieldDemo
                label="suggestions (type, ↑ ↓, enter)"
                htmlFor="sg-suggest"
            >
                <SuggestInput
                    id="sg-suggest"
                    value={name}
                    onValueChange={setName}
                    options={options}
                    onOptionSelect={option => setName(option.value)}
                    placeholder="type or pick from earlier entries"
                />
            </FieldDemo>
            <FieldDemo label="toggle group" htmlFor="sg-toggle">
                <ToggleGroup
                    id="sg-toggle"
                    type="single"
                    variant="outline"
                    size="sm"
                    value={kind}
                    onValueChange={value => value && setKind(value)}
                    className="w-full"
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
            </FieldDemo>
            <FieldDemo label="select" htmlFor="sg-select">
                <Select defaultValue="EUR">
                    <SelectTrigger id="sg-select" size="sm" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {['EUR', 'USD', 'CHF'].map(c => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FieldDemo>
        </div>
    );
}

export function Overlays(): React.ReactElement {
    return (
        <Specimen label="open to inspect">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        dialog
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base">
                            new entry
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Focused tasks: one form, one decision.
                        </DialogDescription>
                    </DialogHeader>
                    <Input placeholder="name" />
                    <DialogFooter className="items-center sm:justify-between">
                        <span className="text-xs text-muted-foreground">
                            ↵ to save
                        </span>
                        <Button>add entry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                        sheet (drawer)
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full gap-0 sm:max-w-md">
                    <SheetHeader className="border-b">
                        <SheetTitle className="text-base">
                            Oktober 2026
                        </SheetTitle>
                        <SheetDescription className="text-xs">
                            Browsing context next to the sheet.
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </Specimen>
    );
}

interface SpecimenProps {
    label: string;
    children: React.ReactNode;
}

function Specimen({label, children}: SpecimenProps): React.ReactElement {
    return (
        <div className="grid gap-2">
            <span className="text-2xs tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </span>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}

interface FieldDemoProps {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
}

function FieldDemo({
    label,
    htmlFor,
    children,
}: FieldDemoProps): React.ReactElement {
    return (
        <div className="grid gap-1.5">
            <Label
                htmlFor={htmlFor}
                className="text-xs tracking-wider text-muted-foreground uppercase"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}
