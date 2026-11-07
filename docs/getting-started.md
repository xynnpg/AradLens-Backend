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

Dev mode answers auth and health with local stubs and needs no upstream API.

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

## Configuration

Copy `.env.example` to `.env` to feed `docker compose`. For a local run, set the variables in your shell, or start with `node --env-file=.env server.js`.

| Variable              | Default                                 | Purpose                             |
| --------------------- | --------------------------------------- | ----------------------------------- |
| `PORT`                | `4173`                                  | Local server port                   |
| `ARADLENS_API_ORIGIN` | `https://api.aradlens.binarysquad.club` | Upstream API origin                 |
| `DEV_MODE`            | _(unset)_                               | Set `true` to enable local login    |

Next: [architecture](./architecture.md).
