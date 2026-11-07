# AradLens Admin

Operational admin workspace for AradLens. A dependency-free front end (plain
HTML, CSS, JavaScript) served by a small Node.js proxy that talks to the
AradLens API and keeps the session token out of the browser.

## What it does

- Sign in, register via invite, and change password through same-origin `/api/*` routes.
- Browse, search, filter, create, edit, and delete locations, including images.
- Issue invite codes and manage administrator accounts.
- Review the operations queue, location map picker, and API health.
- Switch day/night theme and English/Romanian language.

## Quick start

1. Open a terminal in the repo root.
2. Start the server:

   ```powershell
   npm start
   ```

3. Open <http://localhost:4173> and sign in.

## Documentation

- [Getting started](docs/getting-started.md) — prerequisites, run steps, credentials.
- [Architecture](docs/architecture.md) — how the front end, proxy, and cookie session fit together.
- [API](docs/api.md) — proxy routes and auth behavior.
- [Theming and language](docs/theming-and-language.md) — day/night themes, EN/RO switching, design tokens.

## License

Copyright (C) 2026 xynnpg. Released under the GNU General Public License v3.0
or later. See [LICENSE](LICENSE).
