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

Open `http://localhost:4174` and sign in with `admin` / `admin`. Development mode is opt-in and must not be enabled in production.

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

The local server proxies authentication through same-origin `/api/*` routes. Successful login stores the API bearer token in an `HttpOnly` cookie rather than browser storage.

## Supported API flows

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/health`

## Validation

```powershell
npm run check
```
