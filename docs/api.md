# API

Use this table to see which `/api/*` routes the proxy handles. All routes are
same-origin to the admin server; `server.js` is authoritative.

## Route table

| Method | Route | Auth required | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Sign in; sets session cookies |
| `POST` | `/api/auth/register` | No | Register via invite code; requires `legal_accepted: true` and `terms_version` |
| `GET` | `/api/auth/me` | Yes | Current account |
| `POST` | `/api/auth/logout` | No | Sign out; clears cookies |
| `POST` | `/api/auth/change-password` | Yes | Change password |
| `GET` | `/api/auth/accounts` | Yes | Accessible accounts |
| `POST` | `/api/auth/switch` | Yes | Switch active account |
| `GET` | `/api/health` | No | Upstream API health |
| `GET` | `/api/admins` | Yes | List admins |
| `PUT` | `/api/admins/:id` | Yes | Update an admin's `role` and `is_active` (superadmin only) |
| `PATCH` | `/api/admins/me` | Yes | Update your own `username` and `email` (`old_password` required) |
| `GET` | `/api/invites` | Yes | List invites |
| `POST` | `/api/invites` | Yes | Create invite |
| `GET` | `/api/locations` | No | List locations |
| `GET` | `/api/locations/:id` | No | Location detail |
| `POST` | `/api/locations` | Yes | Create location |
| `PATCH` / `PUT` | `/api/locations/:id` | Yes | Update location |
| `DELETE` | `/api/locations/:id` | Yes | Delete location |
| `GET` | `/api/locations/:id/images` | No | Download images (ZIP) |
| `POST` | `/api/locations/:id/images` | Yes | Upload image |
| `GET` | `/api/tours` | No | List tours |
| `POST` | `/api/tours` | Yes | Create a tour from ordered location ids |
| `GET` | `/api/tours/:id` | No | Tour detail |
| `PUT` | `/api/tours/:id` | Yes | Update a tour |
| `DELETE` | `/api/tours/:id` | Yes | Delete a tour |
| `GET` | `/api/geocode/reverse?lat=&lon=` | No | Server-side Nominatim reverse geocode proxy (cached, rate-limited) |

`:id` matches digits only. Any other `/api/*` path is not proxied.

Administrator create and delete are not proxied: accounts are created through
invites, and a superadmin can only change another admin's role and active
status. Every signed-in admin can update their own username and email with
`PATCH /api/admins/me`; the body carries `username`, `email`, and
`old_password`. Password changes stay on `POST /api/auth/change-password`.

Registration and capture writes require the current legal terms version. The
proxy validates and records consent, then strips `legal_accepted` and
`terms_version` before forwarding upstream. Consent records are appended to
`CONSENT_LOG_PATH` (default `./data/consent.log`).

## Capture links

`server.js` answers these locally — they never reach the upstream API, and link
creation only needs a signed-in session:

| Method | Route | Auth required | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/capture-links` | Yes | Mint a random token (24 h TTL); returns `{ token, url, lan, expires_at }` |
| `GET` | `/api/capture/:token` | No | `{ valid: true, theme, expires_at }`, or `404` when unknown/expired |
| `POST` | `/api/capture/:token` | No | Create a location with the link owner's session |
| `POST` | `/api/capture/:token/images?id=:id` | No | Upload the photo for that location |
| `GET` | `/capture/:token` | No | Serves `capture.html`, the no-login phone page |

Tokens are minted with `crypto.randomBytes` and kept in memory, so they are lost
on restart. `POST /api/capture-links` accepts `{ "theme": "day" | "night" }`; anything else
falls back to `day`. `GET /api/capture/:token` returns it so the phone page opens
in the admin's theme.

The returned `url` uses `PUBLIC_ORIGIN` when set, otherwise the host of the
incoming request. When that host is loopback (`localhost`, `127.0.0.1`) and the
machine has a LAN address, the response carries that address instead and sets
`lan: true`, so a phone on the same network can open the link.

The two capture write routes hold the creator's bearer token, so the phone user
never signs in.

## Upstream mapping

The proxy rewrites paths before calling the API:

- `/api/auth/*` → `/auth/*`
- `/api/admins*`, `/api/invites*`, `/api/locations*`, `/api/tours*` → the same path without the `/api` prefix
- everything else → `/health`

## Auth behavior

- **Cookie session** — login sets HttpOnly, `SameSite=Lax`, `Path=/` cookies:
  `aradlens_token` (active token), `aradlens_accounts` (all account tokens),
  `aradlens_active` (selected username). `Max-Age` comes from the API `expires_in`.
  Cookies add `Secure` when the request is HTTPS (direct TLS or
  `X-Forwarded-Proto: https`), or when `PUBLIC_ORIGIN` starts with `https://`.
- **Bearer header** — a request may instead send `Authorization: Bearer <token>`.
  The proxy prefers the active cookie token; if none, it forwards the client header.
- **Gate** — with no token available, the proxy returns `401 { "detail": "Not
  authenticated" }` for the routes marked "Yes", except `/api/auth/switch`, which
  returns `404`. `GET /api/locations/:id/images` is not gated, but forwards the token
  when present.
- **Expiry** — `app.js` treats a `401` on any non-login call as an expired session,
  clears local state, and returns to the login view.
- **Logout / switch** — `/api/auth/logout` removes the active account and clears
  cookies when none remain; `/api/auth/switch` sets the active account, or `404` if
  the account is unknown.

## Dev mode

Active only when `DEV_MODE=true`. The routes below are answered locally; all others still proxy to the upstream API.

- `POST /api/auth/login` accepts username `admin` with password `admin` or
  `administrare`, then sets `aradlens_token=dev-token`.
- `GET /api/auth/me` and `POST /api/auth/change-password` return stub responses for
  the `dev-token` session.
- `GET /api/health` returns a stub for any caller in dev mode.

## Errors

- `400` — invalid or oversized JSON body.
- `401` — not authenticated.
- `404` — unknown account on switch; unknown or expired capture token; unproxied paths fall through to static `404`.
- `422` — capture submission without a place name or coordinates.
- `502` — upstream API unreachable.

Related: [architecture](./architecture.md).
