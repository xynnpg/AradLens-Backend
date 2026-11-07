# AradLens Admin

Operational admin workspace for AradLens. A dependency-free front end (plain
HTML, CSS, JavaScript) served by a small Node.js proxy that talks to the
AradLens API and keeps the session token out of the browser.

## What it does

- Sign in, register via invite, and change password through same-origin `/api/*` routes.
- Browse, search, filter, create, edit, and delete locations, including images.
- Tag locations with a category, and manage the category list (create, rename, delete).
- Chain important points into ordered tours, with create, edit, and delete actions.
- Record a location on a phone without signing in: generate a 24-hour capture link.
- Issue invite codes, update administrator roles and active status, and edit your own account.
- Review the operations queue, location map picker, and API health.
- Switch day/night theme and English/Romanian language.

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
