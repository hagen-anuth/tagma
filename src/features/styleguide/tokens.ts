/** Colour tokens declared in globals.css, with the role each one plays. */
export const COLOR_GROUPS = [
    {
        title: 'surfaces',
        tokens: [
            ['workbench', 'page background behind every card'],
            ['pg-dot', 'workbench dot grid'],
            ['card', 'the floating sheet card'],
            ['popover', 'dialogs, drawer, menus'],
            ['muted', 'row hover, dialog footers, editing rows'],
            ['accent', 'selected month column'],
            ['highlight', 'current month column'],
            ['secondary', 'secondary buttons'],
        ],
    },
    {
        title: 'text',
        tokens: [
            ['foreground', 'body text, values'],
            ['muted-foreground', 'labels, meta, empty cells'],
            ['primary-foreground', 'text on primary'],
        ],
    },
    {
        title: 'lines',
        tokens: [
            ['border', 'card edges, row dividers'],
            ['input', 'field borders'],
            ['ring', 'focus ring'],
        ],
    },
    {
        title: 'meaning',
        tokens: [
            ['primary', 'the one main action per view'],
            ['positive', 'income toggle, net ≥ 0'],
            ['negative', 'net < 0'],
            ['destructive', 'delete, errors'],
        ],
    },
] as const;

/** The px type scale from globals.css, smallest first. */
export const TYPE_SCALE = [
    ['text-2xs', 10, 'uppercase section and stat labels'],
    ['text-xs', 11, 'meta, hints, errors, column headers, lists'],
    ['text-sm', 12, 'sheet cells, controls, dense text'],
    ['text-base', 13, 'body, titles, totals, the root size'],
] as const;

export const RADII = [
    ['rounded-sm', 'tight chips'],
    ['rounded-md', 'small buttons, list rows'],
    ['rounded-lg', 'controls, inputs, popovers'],
    ['rounded-xl', 'cards, dialogs'],
] as const;
