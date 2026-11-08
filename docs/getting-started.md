# Getting started

Run the admin workspace locally, in dev mode, or in Docker.

## Prerequisites

- Node.js 22 or newer. Confirm with:

  ```powershell
  node --version
  ```

- Docker, only for the Docker path.
- No `npm install` is needed. The project has no dependencies.

## Run locally

1. Open a terminal in the repo root.
2. Start the server:

   ```powershell
   npm start
   ```

3. Open <http://localhost:4173>.
4. Sign in with your AradLens administrator account.

The server proxies the upstream API at `https://api.aradlens.binarysquad.club` by default.

## Run in dev mode

Dev mode answers auth, the administrator roster and health with local stubs, so
it needs no upstream API. Other data still proxies when the upstream is
reachable. Use normal mode (without `DEV_MODE`) to sign in through the live API
and see the real administrators.

1. Start the server with `DEV_MODE` on:

   ```powershell
   $env:DEV_MODE="true"; $env:PORT="4174"; node server.js
   ```

2. Open <http://localhost:4174>.
3. Sign in with the dev-mode credentials from the Login credentials table below.

Do not enable `DEV_MODE` in production. It accepts a local login.

## Run in Docker

1. Build and start the service:

   ```powershell
   docker compose up --build
   ```

2. Open <http://localhost:4173>.
3. Stop the service:

   ```powershell
   docker compose down
   ```

## Login credentials

| Mode        | Username            | Password                  |
| ----------- | ------------------- | ------------------------- |
| Real API    | Your admin account  | Your password             |
| Dev mode    | `admin`             | `admin` or `administrare` |

## Validate

Run syntax checks on the front end and server:

```powershell
npm run check
```

## Record a location from a phone

1. Sign in, open **Important points**, and choose **Generate link**.
2. Open the copied link on the phone — no sign-in is needed.
3. Record the GPS position, take a photo, and save.

The link stays valid for 24 hours and can be reused. Tokens live in the memory of
`server.js`, so restarting the server invalidates them, and the phone page opens in
the theme that was active when the link was created.

When the admin console runs on `localhost`, the proxy swaps in this machine's LAN
address so a phone on the same network can open the link. Set `PUBLIC_ORIGIN` to pin
a public address instead.

## Configuration

Copy `.env.example` to `.env` to feed `docker compose`. For a local run, set the variables in your shell, or start with `node --env-file=.env server.js`.

| Variable              | Default                                 | Purpose                                                        |
| --------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `PORT`                | `4173`                                  | Local server port                                              |
| `ARADLENS_API_ORIGIN` | `https://api.aradlens.binarysquad.club` | Upstream API origin                                            |
| `DEV_MODE`            | _(unset)_                               | Set `true` to enable local login                               |
| `PUBLIC_ORIGIN`       | _(unset)_                               | Base URL used in capture links; defaults to the request host  |

Next: [architecture](./architecture.md).
