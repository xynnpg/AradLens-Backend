# Architecture

Read this to see where a request goes and which file owns which concern.

## Pieces

- **Static front end** â€” `index.html`, `app.js`, `styles.css`. No build step, no framework, no dependencies.
- **Capture page** â€” `capture.html`. A standalone phone page served at `/capture/<token>`; it shares `styles.css` and does not load `app.js`.
- **Node proxy** â€” `server.js`. Serves the static files, forwards `/api/*` to the upstream API, and answers `/api/capture/*` locally.
- **HttpOnly cookie session** â€” the bearer token is stored in a cookie the browser JavaScript cannot read.
- **Upstream API** â€” the AradLens API at `ARADLENS_API_ORIGIN`.

## Request flow

```text
Browser (index.html + app.js)
        |
        |  same-origin fetch /api/*   (credentials: same-origin)
        v
Node proxy (server.js)
        |  reads token from HttpOnly cookie
        |  adds: Authorization: Bearer <token>
        v
AradLens API (ARADLENS_API_ORIGIN)
        |
        v
Node proxy  ->  Browser   (JSON, or raw file for images)
```

The proxy never returns the token to the browser. A successful login sets the
`aradlens_token` cookie; later requests carry it automatically.

## Auth in one pass

1. `app.js` posts to `/api/auth/login`.
2. The proxy calls the upstream `/auth/login`.
3. On success the proxy sets HttpOnly cookies (`aradlens_token`, `aradlens_accounts`, `aradlens_active`).
4. Later `/api/*` calls carry the cookie; the proxy turns it into an `Authorization: Bearer` header.
5. A `401` on any non-login call makes `app.js` clear the session and show the login view.

See [api](./api.md) for the route table and full auth rules.

## Project file map

```text
index.html      Markup, inline styles, UI copy, illustration symbols
app.js          UI state, rendering, translations, API client
capture.html    No-login phone page for recording a location
styles.css      Design tokens, day/night themes, component styles
fonts.css       Self-hosted Literata / Public Sans faces
legal.css       Shared styling for the legal pages
terms.html      Terms of Use
privacy.html    GDPR privacy notice
cookies.html    Cookie and storage notice
content-policy.html  Content rules, reports and takedown process
accessibility.html   Accessibility statement
assets/         Self-hosted fonts and Leaflet distribution
server.js       Static file server, API proxy, cookie session, capture-link store,
                security headers, consent/geocode proxy
package.json    npm scripts (start, check)
Dockerfile      Container image (node:22-alpine)
compose.yaml    Docker Compose service definition
.env.example    Environment variable template
docs/           This documentation set
LICENSE         GPL-3.0-or-later
```

## Capture links

A signed-in admin asks `server.js` for a capture link. The proxy mints the token
itself (`crypto.randomBytes`, no upstream call), keeps the creator's bearer token
in memory for 24 hours, and returns a URL on this site. The phone opens
`capture.html`, and the proxy replays the stored bearer token when the phone
saves, so the visitor never signs in.

```text
Phone (capture.html)  ->  /api/capture/:token  ->  server.js (stored bearer)  ->  API
```

## Runtime facts

- Default port: `4173` (`PORT`).
- MIME types served: `.html`, `.css`, `.js`, `.json`; other files are sent as `text/plain`.
- JSON request bodies are capped at 100 KB; uploaded files at 25 MB.
- A request for `/favicon.ico` is answered with `204`.

## Serving behavior

- On serve, the proxy injects `ARADLENS_API_ORIGIN` into the `aradlens-api-origin` meta tag of `index.html`.
- Unknown `/api/*` routes fall through to static serving and return `404`.

## Related

- [Getting started](./getting-started.md)
- [API](./api.md)
- [Theming and language](./theming-and-language.md)

## Legal and security layer

- Legal pages ship as static HTML with fixed text; no template placeholders remain.
- Registration and capture writes must include the current `terms_version` and an
  explicit acceptance flag. The proxy validates this before forwarding, records the
  acceptance in `CONSENT_LOG_PATH`, then strips the two fields.
- Cookies gain `Secure` on HTTPS. Responses carry CSP, HSTS (HTTPS only),
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` and `Cross-Origin-*` headers.
- `/api/geocode/reverse` proxies Nominatim server-side with caching and rate limiting,
  so the browser no longer calls Nominatim directly.
- Admin and capture uploads are re-encoded through a canvas before upload where the
  browser supports it, which removes EXIF metadata and caps the image dimension.
