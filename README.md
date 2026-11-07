# AradLens Admin

Small operational admin workspace for AradLens.

## Run locally

```powershell
npm start
```

Open `http://localhost:4173`.

For local UI development without the remote API, use development mode in Command Prompt:

```bat
set DEV_MODE=true && set PORT=4174 && node server.js
```

Open `http://localhost:4174` and sign in with `admin` / `admin` (or `administrare`). Development mode is opt-in and must not be enabled in production.

## Run with Docker Compose

Build and start the admin server with:

```powershell
docker compose up --build
```

Open `http://localhost:4173`. The host port can be changed through `PORT` in
`.env`; `ARADLENS_API_ORIGIN` can be overridden there as well. Stop the
container with:

```powershell
docker compose down
```

## Configuration

Copy `.env.example` to `.env` and set:

- `PORT` — local server port, default `4173`
- `ARADLENS_API_ORIGIN` — upstream AradLens API origin
- `DEV_MODE` — set to `true` only for local development; enables `admin` / `admin`

The local server proxies authentication through same-origin `/api/*` routes. Successful login stores the API bearer token in an `HttpOnly` cookie rather than browser storage. Authenticated requests may also supply an `Authorization` header; the proxy forwards it when no session cookie is present.

## Supported API flows

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/health`
- `GET /api/admins`
- `POST /api/admins`
- `GET /api/admins/:id`
- `PUT /api/admins/:id`
- `DELETE /api/admins/:id`

## Language behavior

The interface supports English and Romanian. Use either language picker in the login or admin header; the choice is retained in browser storage when available and falls back safely to English if storage is blocked or contains an unsupported value. Static labels, placeholders, accessibility text, confirmations, toasts, loading/error states, breadcrumbs, filters, and view toggles follow the selected language. Filter and list-view behavior uses stable data values, so changing language does not change the selected records.

## Validation

```powershell
npm run check
```
