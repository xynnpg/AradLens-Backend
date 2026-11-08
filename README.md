# AradLens Admin

Operational admin workspace for AradLens. A dependency-free front end (plain
HTML, CSS, JavaScript) served by a small Node.js proxy that talks to the
AradLens API and keeps the session token out of the browser.

## What it does

- Sign in, register via invite, and change password through same-origin `/api/*` routes.
- Browse, search, filter, create, edit, and delete locations, including images.
- Tag locations with a category, and manage the category list (create, rename, delete).
- Chain important points into ordered tours: drag points into the route, reorder stops by dragging, and create, edit or delete tours.
- Open a tour as a route map with numbered stops, walking order, distance, a stop list, and a Direct/Streets toggle for road-following walking routes.
- Place locations on a Romania-only picker with place search, fit-to-country, and device location.
- Record a location on a phone without signing in: generate a 24-hour capture link.
- Issue invite codes, update administrator roles and active status, and edit your own account.
- Review the operations queue, location map picker, and API health.
- Search the whole workspace from a Spotlight-style panel: pages, places, tours, administrators, categories and actions. Open it with `/`, `Ctrl+K` or the topbar search control.
- Switch day/night theme and English/Romanian language; the legal pages follow the same saved theme.

## Development

| Command | What it does |
| --- | --- |
| `npm start` | Run the proxy and serve the workspace on port 4173. |
| `npm run check` | Syntax-check `app.js` and `server.js`. |
| `npm run skills:commands` | Regenerate `.opencode/commands/` from `.agents/skills/`. |

### Preview error screens

The recovery surface can be reviewed without breaking the API:

- `/#error` — lost connection
- `/#error/404` — page not found
- `/#error/500` — server error

The recovery routes can be opened directly. Unknown hashes show the real 404,
and a failed session restore shows the offline or server-error surface with a
working retry. The Debug page is restricted to superadmins and holds the health
check.

Every installed skill is also a slash command — `/code-review`, `/tdd`,
`/wizard` — so it can be reached without remembering the skill's id. See
[.opencode/COMMANDS.md](.opencode/COMMANDS.md).

## Quick start

1. Open a terminal in the repo root.
2. Start the server:

   ```powershell
   npm start
   ```

3. Open <http://localhost:4173> and sign in.

## Legal compliance

The app ships with a legal layer for EU/Romania operation:

- `/terms.html` — Terms of Use (EULA)
- `/privacy.html` — GDPR privacy notice
- `/cookies.html` — cookie and storage notice
- `/content-policy.html` — content rules, reports and takedown
- `/accessibility.html` — accessibility statement

The legal pages use fixed text and no template placeholders. Registration and
capture submissions require accepting the current terms; the proxy records
acceptance in `CONSENT_LOG_PATH` (default `./data/consent.log`, gitignored).
Cookies add `Secure` on HTTPS, and responses carry CSP, HSTS (HTTPS only), frame
and MIME protections. The browser reverse-geocode call is proxied through the
server, and uploads are re-encoded client-side where supported to strip EXIF
metadata.

Operator contact details, data-subject request channels and reporting emails are
intentionally not wired up yet because this is an internal admin workspace.
Add them to the legal pages when public contact channels exist.

The included text is a compliance baseline, not legal advice. Have Romanian
counsel review the operator details, legal bases, retention periods and
accessibility statement before production use.

## Documentation

- [Getting started](docs/getting-started.md) — prerequisites, run steps, credentials.
- [Architecture](docs/architecture.md) — how the front end, proxy, and cookie session fit together.
- [API](docs/api.md) — proxy routes and auth behavior.
- [Theming and language](docs/theming-and-language.md) — day/night themes, EN/RO switching, design tokens.

## License

Copyright (C) 2026 xynnpg. Released under the GNU General Public License v3.0
or later. See [LICENSE](LICENSE).
