# AradLens Admin

Small operational admin workspace for AradLens.

## Run locally

```powershell
npm start
```

Open `http://localhost:4173`.

## Configuration

Copy `.env.example` to `.env` and set:

- `PORT` — local server port, default `4173`
- `ARADLENS_API_ORIGIN` — upstream AradLens API origin

The local server proxies authentication through same-origin `/api/*` routes. Successful login stores the API bearer token in an `HttpOnly` cookie rather than browser storage.

## Supported API flows

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/logout`
- `GET /api/health`

## Validation

```powershell
npm run check
```
