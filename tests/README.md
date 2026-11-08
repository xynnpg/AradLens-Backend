# AradLens admin UI tests

The suite starts its own local server on a free port, mocks every `/api/*`
request in Playwright, and uses `[TEST QA]` fixtures. It never writes to the
production API and does not need TestManager credentials to run.

## Run

```powershell
npm test
```

The runner:

- serves the app from a random local port;
- runs `tests/app.test.js` with Node's test runner;
- writes JUnit XML to `.reports/junit.xml`.

## TestManager command suite

Use this command and report path when creating a TestManager `command` suite:

```text
command: npm test
report:  .reports/junit.xml
```

The suite covers login, every admin page, global search, important points,
tour drag-and-drop/reordering, administrators, access control, invites, debug
permissions, settings, recovery screens, legal pages, mobile behaviour and a
visible-control accessibility/overflow audit.

Playwright browsers must be available once on the machine:

```powershell
npx playwright install chromium
```
