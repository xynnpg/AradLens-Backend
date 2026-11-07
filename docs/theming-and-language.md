# Theming and language

Change the theme or language from the toggles in the top bar or on the login
screen; both are remembered per browser.

## Day/night theme

1. Click the theme toggle (`Night` / `Day`) in the top bar or login screen.
2. The choice is saved to `localStorage` under `aradlens-theme` (`day` or `night`).
3. On load, an unsupported or missing value falls back to `day`.

The theme is applied two ways:

- `html[data-theme="night"]` — the single source of truth for the night theme.
  It carries the whole night token set plus `color-scheme: dark`.
- `.theme-night` — a class added to the login view and the app shell. It is
  retained for compatibility, but no theme values are defined against it any
  more. Every night rule now hangs off `html[data-theme="night"]`, so the two
  views and the standalone capture page all follow the same scope.

## Capture page theme

The capture page (`capture.html`) has no toggle of its own. When an admin creates
a capture link, `app.js` sends the active theme with the request, and the token keeps
it for its 24-hour life. The phone reads it from `GET /api/capture/:token`, sets
`html[data-theme]`, and updates the browser `theme-color` meta tag, so the page
matches the console without relying on the phone's `localStorage`.

## Language

1. Use either language picker (`EN` / `RO`, or English / Română).
2. The choice is saved to `localStorage` under `aradlens-language` (`en` or `ro`).
3. On load, an unsupported or missing value falls back to `en`.

`app.js` sets `<html lang>`, the document title, static labels, placeholders,
`aria-label` and `title` text, messages, and toasts. Filtering and list views use
stable data values, so switching language never changes the selected records.

## Storage fallback

Both preferences use `readPreference` / `writePreference`, which wrap storage in
`try/catch`.

- If storage is blocked, the default (`day`, `en`) is used.
- If a write fails, the app keeps working; the choice just is not persisted.
- The signed-in flag is separate: `app.js` uses `sessionStorage` key
  `aradlens-admin-auth` for the current tab session only.

## Design tokens

The system is called **Clay**. `styles.css` is organised in layers, in this order:

1. **`:root`** — the light token set. Surfaces (`--canvas`, `--blueprint`,
   `--surface-2`), the rail (`--anchor`, `--rail-fg`, `--rail-muted`,
   `--rail-border`), lines (`--border`, `--border-strong`), the text ramp
   (`--ink`, `--text-2`, `--text-3`), the clay accent (`--accent`,
   `--accent-hi`, `--accent-text`, `--accent-fg`, `--accent-soft`,
   `--accent-on-rail`), the state pair (`--ok-*`, `--warn-*`, `--bad-*`,
   `--signal-mint`), `--focus`, `--schematic`, the three depth tokens
   (`--shadow-1/2/3`), the radius ladder (`--r-xs` … `--r-pill`) and the motion
   tokens (`--ease`, `--dur-1/2/3`).
2. **Legacy aliases** — the older names (`--paper`, `--concrete`, `--steel`,
   `--grid-line`, `--line`, `--print`, `--muted`, `--mint-fill`, `--apricot-fill`,
   `--coral-fill`, `--signal-*`, …) are kept as `var()` aliases of the new
   primitives, so every existing reference still resolves.
3. **`html[data-theme="night"]`** — the same primitive set with dark values.
   Because the aliases point at primitives, they re-resolve automatically; the
   night block only has to override the primitives.
4. **Component styles** — buttons, sidebar, panels, cards, tables, modals, toasts.
5. **Craft layer** — continuous G2 corners behind `@supports (corner-shape)`,
   the motion curves, the focus ring and the elevation rules.
6. **Responsive and motion** — breakpoints at `1100px`, `760px`, and `450px`; a
   `prefers-reduced-motion` block disables animation and transitions.

### Type system

Two families, self-hosted in `assets/fonts/` and declared once in `fonts.css`:

- **Literata** (variable, with an optical-size axis) carries voice: the page
  title, the login headline and the wordmark. It is set with
  `font-optical-sizing: auto`, so the letterforms shift as the size changes.
- **Public Sans** (variable) carries everything else, including every number.
  Numbers are data, so they stay in the sans, where true tabular figures make
  the metric column align.
- Identifiers and code use the system monospace stack, so no third family is
  downloaded.

Both families are under the SIL Open Font License 1.1; the licence texts sit
next to the font files in `assets/fonts/`.

### Rules

- **Never use `--anchor` as ink.** `--anchor` is the rail colour; on the night
  theme it is almost black and would be invisible on a dark panel. Body text
  uses `--ink`, and anything drawn on the rail uses `--rail-fg` or `--rail-muted`.
- **Never put `--text-3` on a tinted fill.** Use `--text-2`; the muted ramp is
  not strong enough on mint, apricot or rose.
- **The ink metric card inverts with the theme.** Its background is `--ink` and
  its text is `--canvas`, so both are set from tokens rather than literals.
- **Never set a number in the display face.** Literata is for words. Metric
  values, counters and timestamps belong to Public Sans, where the tabular
  figures line up.
- To restyle an element, prefer overriding a token over editing a component
  rule.

Related: [getting started](./getting-started.md).

