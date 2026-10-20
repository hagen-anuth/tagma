'use client';

import {useEffect, useRef, useState} from 'react';

import {cn} from '@/lib/utils';

import {COLOR_GROUPS} from './tokens';

const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

/** Each theme in its own panel, so both are visible whatever the page theme. */
export function ColorTokens(): React.ReactElement {
    return (
        <div className="grid gap-6">
            {COLOR_GROUPS.map(group => (
                <div key={group.title} className="grid gap-2">
                    <h3 className="text-2xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        {group.title}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        {THEMES.map(theme => (
                            <ThemePanel
                                key={theme}
                                theme={theme}
                                tokens={group.tokens}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ThemePanelProps {
    theme: Theme;
    tokens: readonly (readonly [string, string])[];
}

function ThemePanel({theme, tokens}: ThemePanelProps): React.ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const style = ref.current && getComputedStyle(ref.current);
        if (!style) return;
        setValues(
            Object.fromEntries(
                tokens.map(([name]) => [
                    name,
                    toHex(style.getPropertyValue(`--${name}`).trim()),
                ]),
            ),
        );
    }, [tokens]);

    return (
        <div
            ref={ref}
            className={cn(
                theme,
                'rounded-lg border bg-[var(--workbench)] p-2 text-foreground',
            )}
        >
            <div className="mb-1 px-1 text-2xs tracking-[0.18em] text-muted-foreground uppercase">
                {theme}
            </div>
            <ul className="grid gap-1">
                {tokens.map(([name, role]) => (
                    <li
                        key={name}
                        className="grid grid-cols-[2.25rem_1fr] items-center gap-3 rounded-md bg-[var(--card)] p-1.5"
                    >
                        <span
                            className="size-9 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
                            style={{background: `var(--${name})`}}
                        />
                        <span className="min-w-0">
                            <span className="flex justify-between gap-2 text-xs">
                                <code>--{name}</code>
                                <span className="truncate text-muted-foreground">
                                    {values[name] ?? ''}
                                </span>
                            </span>
                            <span className="block truncate text-2xs text-muted-foreground">
                                {role}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * The colour as rendered, in sRGB hex. The CSS build rewrites oklch() into
 * lab(), so the declared string is not the readable one.
 */
function toHex(color: string): string {
    const context = document.createElement('canvas').getContext('2d');
    if (!context || !color) return color;
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(
        0,
        0,
        1,
        1,
    ).data;
    const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    return a === 255 ? hex : `${hex} · ${Math.round((a / 255) * 100)}%`;
}
