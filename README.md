# AradLens Admin

Operational admin workspace for AradLens. A dependency-free front end (plain HTML,
CSS, and JavaScript) served by a small Node.js proxy that talks to the AradLens API
and keeps the session token out of the browser.

## Features

- **Authentication** — login, registration via invite, and change-password, proxied
  through same-origin `/api/*` routes. The API bearer token is stored in an
  `HttpOnly` cookie, never in `localStorage` or `sessionStorage`.
- **Locations** — browse, search, filter, and open location records; create, edit,
  and delete locations; upload, preview, and export location images.
- **Invites** — issue invite codes and register the accounts they unlock.
- **Overview queue** — a live operations queue with loading, empty, and error states.
- **Points map** — coordinate review with reverse geocoding via OpenStreetMap
  Nominatim, status filtering, and list/grid views.
- **Accounts** — list admins and switch between accessible accounts.
- **Health** — a live API health/status probe.
- **Bilingual** — full English and Romanian interface, switchable at any time.
- **Theming** — day and night themes with consistent, contrast-checked surfaces.

## Quick start

```powershell
npm start
```

Open <http://localhost:4173>.

## Development mode

Run the front end without the remote API, in Command Prompt:

```bat
set DEV_MODE=true && set PORT=4174 && node server.js
```

Open <http://localhost:4174> and sign in with `admin` / `admin`. Development mode
accepts a local login and **must not** be enabled in production.

## Docker

```powershell
docker compose up --build
docker compose down
```

The server listens on `http://localhost:4173`. Override the host port with `PORT`
and the upstream API with `ARADLENS_API_ORIGIN` in `.env`.

## Configuration

Copy `.env.example` to `.env` and set:

| Variable              | Default                                     | Purpose                                            |
| --------------------- | ------------------------------------------- | -------------------------------------------------- |
| `PORT`                | `4173`                                      | Local server port                                  |
| `ARADLENS_API_ORIGIN` | `https://api.aradlens.binarysquad.club`     | Upstream AradLens API origin                       |
| `DEV_MODE`            | _(unset)_                                   | Set `true` for local login without the remote API  |

## API routes

The local server proxies these routes. Authenticated routes require a session
cookie or an `Authorization: Bearer <token>` header.

| Method   | Route                          | Auth | Purpose                    |
| -------- | ------------------------------ | ---- | -------------------------- |
| `POST`   | `/api/auth/login`              | —    | Sign in                    |
| `POST`   | `/api/auth/register`           | —    | Register via invite        |
| `GET`    | `/api/auth/me`                 | ✓    | Current account            |
| `POST`   | `/api/auth/logout`             | —    | Sign out                   |
| `POST`   | `/api/auth/change-password`    | ✓    | Change password            |
| `GET`    | `/api/auth/accounts`           | ✓    | Accessible accounts        |
| `POST`   | `/api/auth/switch`             | ✓    | Switch account             |
| `GET`    | `/api/health`                  | —    | API health                 |
| `GET`    | `/api/admins`                  | ✓    | List admins                |
| `POST`   | `/api/admins`                  | ✓    | Create admin               |
| `GET`    | `/api/admins/:id`              | ✓    | Admin detail               |
| `PUT`    | `/api/admins/:id`              | ✓    | Update admin               |
| `DELETE` | `/api/admins/:id`              | ✓    | Delete admin               |
| `GET`    | `/api/invites`                 | ✓    | List invites               |
| `POST`   | `/api/invites`                 | ✓    | Create invite              |
| `GET`    | `/api/locations`               | —    | List locations             |
| `GET`    | `/api/locations/:id`           | —    | Location detail            |
| `POST`   | `/api/locations`               | ✓    | Create location            |
| `PATCH`  | `/api/locations/:id`           | ✓    | Update location            |
| `DELETE` | `/api/locations/:id`           | ✓    | Delete location            |
| `GET`    | `/api/locations/:id/images`    | ✓    | Download images (ZIP)      |
| `POST`   | `/api/locations/:id/images`    | ✓    | Upload image               |

## Project structure

```
index.html    Markup, inline readability styles, and UI copy
app.js        UI state, rendering, and API client
styles.css    Design tokens, theme layers, and component styles
server.js     Static file server and API proxy
compose.yaml  Docker Compose service definition
Dockerfile    Container image
```

## Language behavior

The interface supports English and Romanian. Use either language picker; the choice
is retained in browser storage when available and falls back to English if storage is
blocked or holds an unsupported value. Static labels, placeholders, accessibility
text, confirmations, toasts, loading/error states, breadcrumbs, filters, and view
toggles follow the selected language. Filtering and list-view behavior use stable
data values, so changing language never changes the selected records.

## Validation

```powershell
npm run check
```

## License

Copyright (C) 2026 xynnpg.

Released under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE)
for the full text.
