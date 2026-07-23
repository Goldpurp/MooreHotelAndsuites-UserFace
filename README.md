# Moore Hotels & Suites guest app

The guest app and API use exactly two isolated profiles: `Local` and
`Production`. A generic `.env` file is never used as a fallback.

- `.env.localhost` is used only by the Local Vite mode.
- `.env.production` is used only by the Production Vite mode.

The Local filename intentionally avoids `.env.local`, because Vite loads that
special filename in every mode and it could otherwise contaminate a Production
build.

## Connection matrix

| Profile | Frontend command | Frontend | API | Intended services |
|---|---|---|---|---|
| Local | `yarn dev` or `yarn dev:local` | `http://localhost:3001` | `http://localhost:5222` through `/api` | Local PostgreSQL, local images/email/payment substitutes |
| Production | `yarn build:production` | Deployed HTTPS site | `https://api.moorehotelandsuites.com/api` | Production-only services |

Local uses a same-origin Vite proxy, so browser CORS does not interrupt normal
workstation use. The Production bundle calls the HTTPS API directly. Each
request is marked `local` or `production`, and the API rejects a mismatch.

## Start the complete Local stack

From the API repository:

```bash
bash scripts/run-local.sh
```

From this repository:

```bash
yarn dev
```

Open `http://localhost:3001`. Run `yarn check:local` to verify the API health,
database connection, runtime environment, and room catalogue independently.

## Safety checks

- Every frontend request sends its tier in `X-Moore-App-Environment`.
- The current API returns `X-Moore-API-Environment` and rejects an explicitly
  mismatched browser tier with HTTP 409.
- Server-to-server clients, health monitors, payment webhooks, and CLIs can omit
  the optional tier header.
- Local API startup rejects a remote database or provider configuration.
- Production rejects loopback URLs, insecure origins, wildcard hosts, missing
  providers, and PostgreSQL connections without verified TLS.

Useful gates:

```bash
yarn typecheck
yarn build:local
yarn build:production
yarn check:production
```

`check:production` is intentionally strict: it fails when the deployed API or
database is unhealthy even if the hostname itself responds.

Monnify is independently controlled with `VITE_MONNIFY_ENABLED`. Keep it
`false` until the matching API flag and provider verification are complete.
The API remains the enforcement boundary if a browser is modified.

For the Render Blueprint, security headers, release steps and mobile acceptance
checklist, follow `FRONTEND_RENDER_DEPLOYMENT.md`.
