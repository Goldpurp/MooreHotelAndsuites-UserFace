# Moore Hotels search deployment

## Target searches

Use one primary topic per public page. Keep the wording natural in headings and
body copy; do not add a `meta keywords` tag because Google does not use it for
ranking.

| Page | Primary search intent | Supporting phrases |
| --- | --- | --- |
| `/` | hotel in Sagamu | hotel in Ogun State, Sagamu–Ikenne Road hotel |
| `/rooms` | rooms and suites in Sagamu | hotel rooms in Sagamu, book hotel in Sagamu |
| `/dining` | hotel dining in Sagamu | Nigerian and continental food in Sagamu |
| `/services` | hotel services in Sagamu | hotel with Wi-Fi, parking and backup power |
| `/about` | Moore Hotels & Suites Sagamu | hotel near NYSC Camp Sagamu |
| `/help` | Moore Hotels booking help | Sagamu hotel check-in and booking FAQs |

The route metadata is maintained in `public/seo.js`. Authentication, profile,
checkout, booking-management, verification and password-reset pages are marked
`noindex` so search results do not expose workflow URLs.

The staff dashboard and API are intentionally excluded from search. The
dashboard serves both a `noindex` meta tag and `X-Robots-Tag`; the API serves
`X-Robots-Tag` on every response and disallows all crawling in `/robots.txt`.

## Automatic sitemap and crawler-policy generation

`scripts/generate-seo-files.mjs` runs before every Local or Production build.
It generates `public/sitemap.xml` and `public/robots.txt`, validates both files,
and then Vite copies them to the root of `dist`.

Production generation reads the anonymous, public room catalogue. The API
returns online rooms only, so each published room is added as
`/rooms/{room-guid}`. The generator accepts GUID identifiers only, removes
duplicates, XML-escapes values, enforces the 50,000-URL/50-MB sitemap limits,
and rejects checkout, authentication, profile, booking-reference, verification
and password-reset routes. It also retries a transient API failure. A Production
build fails if the catalogue is unreachable, malformed, or reports the wrong
environment; it will not silently deploy a partial sitemap.

The two isolated profiles use these non-secret settings:

```text
# .env.production
SITE_URL=https://moorehotelandsuites.com
SITEMAP_ROOMS_API_URL=https://api.moorehotelandsuites.com/api/rooms
SITEMAP_REQUIRE_ROOMS_API=true
AI_CRAWLER_POLICY=search-only

# .env.localhost
SITE_URL=https://moorehotelandsuites.com
SITEMAP_ROOMS_API_URL=
SITEMAP_REQUIRE_ROOMS_API=false
AI_CRAWLER_POLICY=search-only
```

Local generation cannot call a remote API, and Production generation cannot
call a loopback or non-HTTPS API. To include Local room records during a Local
build, temporarily set `SITEMAP_ROOMS_API_URL` in `.env.localhost` to the Local
loopback endpoint; never point it at Production.

The default `search-only` AI policy allows search/indexing and user-requested
retrieval crawlers, while declining automated model-training collection. The
other supported values are `allow-all` and `block-all`. Change the Render
`AI_CRAWLER_POLICY` environment value only after an explicit business decision,
then redeploy.

Use these release checks:

```bash
yarn test
yarn build:production
xmllint --noout dist/sitemap.xml
```

Because the guest website is a static Render site, the sitemap is refreshed at
build time. Trigger a new website deploy whenever online rooms are added,
removed, or unpublished. The build log states the exact room and URL counts.

## Files that must be public after deployment

- `https://moorehotelandsuites.com/robots.txt` must return HTTP 200 and
  `text/plain`.
- `https://moorehotelandsuites.com/sitemap.xml` must return HTTP 200 and an XML
  content type, not the SPA homepage.
- Every public route must use its own canonical URL, title and description.
- HTTP and `www` must continue redirecting permanently to
  `https://moorehotelandsuites.com/`.

Room-detail URLs should be added to a generated sitemap only after published
rooms exist in the production database. Never add checkout or booking-reference
URLs to a sitemap.

## Google Search Console

### Recommended: Domain property and DNS verification

1. Deploy the SEO files and verify the public responses below.
2. Open Google Search Console, choose **Add property**, select **Domain**, and
   enter `moorehotelandsuites.com` — no `https://`, `www`, or path.
3. Copy the exact verification value Google provides. At the authoritative DNS
   provider, create a `TXT` record with host/name `@` (or the provider's blank
   root-host value), value `google-site-verification=GOOGLE_PROVIDED_TOKEN`, and
   the provider's automatic/default TTL.
4. Wait for DNS propagation, return to Search Console, and select **Verify**.
   Leave the TXT record in place permanently; removing it can remove verified
   ownership later.
5. Open **Indexing → Sitemaps**, enter `sitemap.xml`, and select **Submit**.
6. Use **URL inspection** to test and request indexing for `/`, `/rooms`,
   `/dining`, `/services`, `/about` and `/help`.
7. Check **Pages**, **Core Web Vitals** and **Enhancements** after Google has
   crawled the site. Indexing is controlled by Google and is not immediate.

### Optional fallback: URL-prefix meta-tag verification

The document head already contains this production-safe Vite template:

```html
<meta name="google-site-verification" content="%VITE_GOOGLE_SITE_VERIFICATION%">
```

For a URL-prefix property, create `https://moorehotelandsuites.com/` in Search
Console and choose **HTML tag**. Copy only the value inside Google's `content`
attribute into the Render build environment as
`VITE_GOOGLE_SITE_VERIFICATION`, redeploy, and confirm **View source** shows the
real token rather than an empty value. Then select **Verify** and keep that
environment value. This value is a public ownership token, not a secret; never
place a Google service-account key in a `VITE_*` variable.

Do not submit the sitemap before the deployed URL returns real XML. Search
Console submission cannot repair a missing or HTML sitemap.

Verify the deployed boundary exactly:

```bash
curl -fsS -D - https://moorehotelandsuites.com/sitemap.xml -o sitemap.xml
curl -fsS -D - https://moorehotelandsuites.com/robots.txt -o robots.txt
xmllint --noout sitemap.xml
```

Both requests must return HTTP 200. The sitemap must have an XML content type,
the robots file must have `text/plain`, and neither response body may be the SPA
HTML document.

## Google Analytics 4

Analytics uses basic consent mode: the Google tag is not downloaded and no
analytics request is sent until a visitor selects **Allow analytics**. Ad
storage and personalised advertising signals stay disabled.

1. Create a GA4 web data stream for `https://moorehotelandsuites.com`.
2. In the Render guest-web service, add `VITE_GA_MEASUREMENT_ID` with the
   stream's public ID (for example, `G-XXXXXXXXXX`).
3. Redeploy the guest website because Vite environment values are embedded at
   build time.
4. Accept analytics in the website notice, then confirm one `page_view` in
   GA4 Realtime and DebugView.
5. Decline analytics, reload, and confirm that no request is made to Google
   Analytics. Visitors can reopen the choice from **Cookie choices**.

Do not place service-account credentials, API secrets, or private keys in a
`VITE_` variable. The Measurement ID is a public routing identifier, not a
secret.

## Deployment verification

- Render/Cloudflare already terminates HTTPS; keep HTTP-to-HTTPS and `www`-to-
  apex redirects enabled, and do not install a certificate inside the static
  app or API container.
- Confirm `Strict-Transport-Security`, the content security policy, and
  `X-Content-Type-Options` after each deployment.
- Confirm the dashboard and API return `X-Robots-Tag: noindex, nofollow,
  noarchive` before requesting indexing for the public guest domain.
