# Moore Hotels Guest Website — Render deployment

Deploy this website only after the API and paid PostgreSQL database pass their
production acceptance checks.

## Render configuration

The checked-in `render.yaml` defines the static site, SPA rewrite, cache policy
and browser security headers. Connect this repository as a Render Blueprint or
copy these settings exactly:

| Setting | Value |
|---|---|
| Service type | Static Site |
| Build command | `yarn install --frozen-lockfile && yarn build:production` |
| Publish directory | `dist` |
| Production branch | protected release branch, then `main` |
| Auto deploy | only after CI checks pass |
| Custom domains | `moorehotelandsuites.com`, `www.moorehotelandsuites.com` |

The checked-in production profile contains only browser-readable values:

```text
VITE_APP_ENV=production
VITE_API_MODE=direct
VITE_API_BASE_URL=https://api.moorehotelandsuites.com/api
VITE_API_TIMEOUT_MS=15000
VITE_MONNIFY_ENABLED=false
```

Never add database, JWT, Brevo, Cloudinary, administrator or Monnify secrets to
this repository or a `VITE_*` value. Every Vite variable is visible to users.

## Payment state

Monnify is intentionally hidden while `VITE_MONNIFY_ENABLED=false`. The API
also rejects Monnify booking attempts while its server flag is disabled, so
changing browser code cannot bypass this control. Direct bank transfer remains
available.

Enable Monnify only after the API deployment guide's sandbox, webhook,
verification, controlled transaction and refund checks pass. Both flags must
then be changed together:

```text
API: MonnifySettings__Enabled=true
Website: VITE_MONNIFY_ENABLED=true
```

Rebuild this website after changing the frontend flag.

## Release procedure

1. Confirm `https://api.moorehotelandsuites.com/api/health` returns a healthy,
   connected response.
2. Run:

   ```bash
   yarn install --frozen-lockfile
   yarn check:profiles
   yarn build:production
   yarn audit:high
   ```

3. Confirm the build contains no source maps, `.env` secrets or private keys.
4. Commit the reviewed release and require `Guest website release gates`.
5. Deploy the exact passing commit.
6. Attach both custom domains and enforce the canonical-domain redirect.
7. Confirm Render applied the SPA rewrite and every header in `render.yaml`.

## Post-deploy acceptance

Test on a real phone, tablet and desktop:

- home, rooms, dining, services and legal pages render without horizontal
  scrolling;
- direct links and page refreshes work on every route;
- room catalogue and availability load from the Production API;
- guest registration, verification, sign-in, password reset and logout work;
- a guest and a signed-in Client can create a direct-transfer booking;
- the booking reference and transfer instructions are visible and copyable;
- booking lookup requires both reference and associated email;
- guest cancellation works and the room becomes available;
- unpaid bookings expire after one hour and show the cancellation state;
- booking, cancellation, expiry and checkout emails arrive;
- profile and avatar updates survive refresh and a new login;
- external payment URLs, when later enabled, are accepted only for trusted
  Monnify HTTPS hosts;
- browser console and network responses contain no tokens, passwords or
  provider secrets;
- CSP, HSTS, `nosniff`, frame denial, referrer policy and permissions policy are
  present.

Run Lighthouse mobile checks after deployment. Investigate any accessibility,
performance, best-practice or SEO score below 90 before public promotion.

## Rollback

Keep the previous successful Render deployment. A frontend rollback does not
roll back the API or database. If a booking contract changed, restore a
compatible website build only after confirming it can safely call the current
API version.
