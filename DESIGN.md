# tagma design

The rules behind tagma's look, for anyone changing the UI, people and agents
alike.

- **Values** live in `src/app/globals.css` and nowhere else.
- **Visual check:** open `/styleguide` in the running app. It renders the live
  tokens and the real components in both themes.

This file says how to use them, and why.

## Principles

1. **A neutral workbench.** The page is a dotted grey bench. Content sits on
   white cards that float above it. Nothing else draws attention.
2. **Colour only carries meaning.** Green means positive (income, net ≥ 0),
   red means negative or destructive. The one exception is the logo.
   Decoration in the app never uses colour.
3. **Dense, small, mono.** Geist Mono throughout, at a 13px root. It is a
   ledger: rows stay tight, and numbers line up.
4. **Numbers come first.** Amounts are tabular, right-aligned and formatted
   for the user's locale. An empty cell is a muted `·`, never `0,00`.
5. **Quiet chrome.** Labels are small, uppercase and tracked, and recede
   behind the values. UI copy is lowercase ("new entry", "add to Oktober").
6. **Both themes, always.** Light and dark come from the same tokens. A
   change is only done once it looks right in both.

## Tokens

### Colour

Use the semantic utilities (`bg-card`, `text-muted-foreground`,
`border-border`, …). Raw hex, `oklch()` and Tailwind palette colours
(`text-green-600`) are not allowed in components. A new colour becomes a token
in `globals.css` with light and dark values, and goes into the styleguide's
list in `src/features/styleguide/tokens.ts`.

| Group    | Tokens                                                                                |
| -------- | ------------------------------------------------------------------------------------- |
| surfaces | `workbench`, `pg-dot`, `card`, `popover`, `muted`, `accent`, `highlight`, `secondary` |
| text     | `foreground`, `muted-foreground`, `primary-foreground`                                |
| lines    | `border`, `input`, `ring`                                                             |
| meaning  | `primary`, `positive`, `negative`, `destructive`                                      |

The role of each token is listed beside it in the styleguide. Some are easy to
mix up:

- `accent` marks the **selected** month.
- `highlight` marks the **current** month.
- `primary` is for the one main action in a view, not for emphasis.

### Type

These are the only four sizes. They are defined in px because the root is
13px, which would push Tailwind's default rem sizes off this scale.

| Class       | Size | Use                                              |
| ----------- | ---- | ------------------------------------------------ |
| `text-2xs`  | 10px | uppercase section and stat labels                |
| `text-xs`   | 11px | meta, hints, errors, column headers, entry lists |
| `text-sm`   | 12px | sheet cells, controls, dense text                |
| `text-base` | 13px | body, titles, totals                             |

- **Weights:** 400, 500 for values that need weight, 600 for titles and the
  wordmark.
- **Section labels:** `text-2xs uppercase tracking-[0.18em]
text-muted-foreground`.
- **Field labels:** `text-xs uppercase tracking-wider`.
- **No arbitrary sizes.** `text-[11px]` and similar are not allowed, and
  `text-lg` and larger have no place in the app.

### Shape and depth

- **Radius:** `rounded-xl` for cards and dialogs, `rounded-lg` for controls
  and popovers, `rounded-md` for rows and small buttons.
- **Elevation:** cards use `shadow-float`, menus and suggestion lists
  `shadow-md`. Nothing else casts a shadow.
- **Spacing:** one Tailwind unit is 3.25px at the 13px root. Pages use `px-4`
  and `sm:px-8`, cards `px-4`.

## Components

- **Primitives** are shadcn components in `src/components/ui`. They are
  generated, so don't edit them. Restyle them through `className` at the call
  site, or add a wrapper in `src/components`.
- **Choosing a surface:**
    - a dialog for a focused task (one form, one decision);
    - the sheet (the drawer that slides in from the right) for browsing next to
      the table;
    - a popover for small settings.
- **Free text with known values** uses `SuggestInput`: a combobox where
  nothing is pre-selected, so Enter on typed text still submits the form.
- **Keyboard:** every action can be reached by keyboard, and Escape closes
  the innermost layer only.

## Money and dates

Format money only through `src/lib/money.ts` and dates only through
`src/lib/dates.ts`, always with the user's preferences. Never use
`toFixed()`, a hand-written currency symbol, or a hard-coded locale.

| Context      | Format                                                    |
| ------------ | --------------------------------------------------------- |
| sheet cell   | `formatAmount`, no symbol (the currency is in the header) |
| single value | `formatMoney`, with symbol                                |
| net          | signed (`+` / `−`); `text-positive` or `text-negative`    |

## Brand

- **Logo:** `public/logo.svg`, a carved-marble meander. It serves as the
  favicon and the header mark. Use it as it is: don't recolour it, crop it or
  put it on a coloured tile. Minimum size is 16px.
- **Easter egg:** the header logo (`LogoMark`) grows and wiggles on hover.
  It is the only playful motion in the app; keep it that way.
- **Name:** always lowercase, `tagma`.
- **Tagline:** "income and expenses, kept in order".
- **README banners:** `docs/banner-*.png` are rendered images. Re-render
  them when the logo or tokens change.

## Review checklist

Before calling a UI change done:

- [ ] It looks right on `/styleguide`, and on the affected screen in both
      themes.
- [ ] It uses only tokens and the four type sizes; no new arbitrary values.
- [ ] Amounts are tabular, right-aligned and formatted with the user's
      preferences.
- [ ] Every action works by keyboard, and Escape behaves.
- [ ] It works at 390px width without horizontal page scroll.
