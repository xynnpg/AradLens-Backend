# Theming and language

Change the theme or language from the toggles in the top bar or on the login
screen; both are remembered per browser.

## Day/night theme

1. Click the theme toggle (`Night` / `Day`) in the top bar or login screen.
2. The choice is saved to `localStorage` under `aradlens-theme` (`day` or `night`).
3. On load, an unsupported or missing value falls back to `day`.

The theme is applied two ways:

- `html[data-theme="night"]` — global variable overrides on the `<html>` element.
- `.theme-night` — a class added to the login view and the app shell.

## Capture page theme

The capture page (`capture.html`) has no toggle of its own. When an admin creates a
capture link, `app.js` sends the active theme with the request, and the token keeps
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

`styles.css` is organized in layers, in this order:

1. **Base `:root`** — the original palette (`--plum`, `--paper`, `--lilac`, `--mint`, …).
2. **Blueprint layer** — a later `:root` re-declaration that sets the operational
   tokens: `--concrete`, `--blueprint`, `--steel`, `--ink`, `--print`, `--muted`,
   `--grid-line`, `--schematic`, and the signal fills (`--signal-*`, `--lavender-fill`,
   `--mint-fill`, `--apricot-fill`).
3. **Theme overrides** — `html[data-theme="night"]`, `.app-shell.theme-night`, and
   `.login-view.theme-night` re-declare the same token names with dark values. Because
   components reference variables, one override flips the whole surface.
4. **Component styles** — buttons, sidebar, panels, cards, tables, modals, toasts.
5. **Responsive and motion** — breakpoints at `1100px`, `760px`, and `450px`; a
   `prefers-reduced-motion` block disables animation and transitions.

To restyle an element, prefer overriding a token (step 2 or 3) over editing a
component rule (step 4).

Related: [getting started](./getting-started.md).
