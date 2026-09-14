import assert from "node:assert/strict";
import test from "node:test";
import {
  createRobotsTxt,
  createSitemapEntries,
  createSitemapXml,
  fetchPublishedRooms,
  loadSeoConfig,
  PUBLIC_ROUTES,
  validateRobotsTxt,
  validateSitemapXml,
} from "../scripts/generate-seo-files.mjs";

const SITE_URL = "https://moorehotelandsuites.com";
const ROOM_ONE = "62d33aaf-c2ee-4d10-819b-b96a4b09f35c";
const ROOM_TWO = "ff4bcde0-2ee5-46d3-9298-78732bd5370a";

test("sitemap contains every public route and unique encoded room URLs", () => {
  const entries = createSitemapEntries(SITE_URL, [
    { id: ROOM_ONE, updatedAt: "2026-08-15T17:00:00Z" },
    { id: ROOM_ONE, updatedAt: "2026-08-15T17:00:00Z" },
    { id: ROOM_TWO, updatedAt: "not-a-date" },
  ]);
  const xml = createSitemapXml(entries);
  const result = validateSitemapXml(xml, SITE_URL);

  assert.equal(result.urlCount, PUBLIC_ROUTES.length + 2);
  assert.ok(result.locations.includes(`${SITE_URL}/rooms/${ROOM_ONE}`));
  assert.ok(result.locations.includes(`${SITE_URL}/rooms/${ROOM_TWO}`));
  assert.match(xml, /<lastmod>2026-08-15<\/lastmod>/);
  assert.doesNotMatch(xml, /not-a-date/);
});

test("sitemap validation rejects private workflow and off-domain URLs", () => {
  const entries = createSitemapEntries(SITE_URL);
  assert.throws(
    () => validateSitemapXml(
      createSitemapXml([...entries, { loc: `${SITE_URL}/checkout/private`, lastmod: null }]),
      SITE_URL,
    ),
    /non-canonical or private/,
  );
  assert.throws(
    () => validateSitemapXml(
      createSitemapXml([...entries, { loc: "https://example.com/rooms/1", lastmod: null }]),
      SITE_URL,
    ),
    /outside the canonical HTTPS origin/,
  );
});

test("search-only robots policy permits search discovery and blocks training crawlers", () => {
  const robots = createRobotsTxt(SITE_URL, "search-only");
  assert.equal(validateRobotsTxt(robots, SITE_URL, "search-only"), true);
  assert.match(robots, /User-agent: OAI-SearchBot[\s\S]*Allow: \//);
  assert.match(robots, /User-agent: Claude-SearchBot[\s\S]*Allow: \//);
  assert.match(robots, /User-agent: GPTBot[\s\S]*Disallow: \//);
  assert.match(robots, /User-agent: Google-Extended[\s\S]*Disallow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${SITE_URL}/sitemap\\.xml`));
});

test("room catalogue fetch retries and rejects malformed production data", async () => {
  let calls = 0;
  const rooms = await fetchPublishedRooms({
    apiUrl: "https://api.moorehotelandsuites.com/api/rooms",
    required: true,
    attempts: 2,
    wait: async () => {},
    fetchImplementation: async () => {
      calls += 1;
      if (calls === 1) throw new Error("temporary failure");
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: ROOM_ONE }],
      };
    },
  });
  assert.equal(calls, 2);
  assert.deepEqual(rooms, [{ id: ROOM_ONE }]);

  await assert.rejects(
    fetchPublishedRooms({
      apiUrl: "https://api.moorehotelandsuites.com/api/rooms",
      required: true,
      attempts: 1,
      fetchImplementation: async () => ({
        ok: true,
        status: 200,
        json: async () => [{ name: "missing id" }],
      }),
    }),
    /entry without an id/,
  );
});

test("optional room fetch failure preserves the static sitemap", async () => {
  const rooms = await fetchPublishedRooms({
    apiUrl: "https://api.moorehotelandsuites.com/api/rooms",
    required: false,
    attempts: 1,
    fetchImplementation: async () => {
      throw new Error("offline");
    },
  });
  assert.deepEqual(rooms, []);
  assert.equal(createSitemapEntries(SITE_URL, rooms).length, PUBLIC_ROUTES.length);
});

test("local and production sitemap sources cannot cross environment boundaries", async () => {
  await assert.rejects(
    loadSeoConfig("localhost", {
      SITE_URL,
      SITEMAP_ROOMS_API_URL: "https://api.moorehotelandsuites.com/api/rooms",
      SITEMAP_REQUIRE_ROOMS_API: "false",
      AI_CRAWLER_POLICY: "search-only",
    }),
    /must target a loopback API/,
  );
  await assert.rejects(
    loadSeoConfig("production", {
      SITE_URL,
      SITEMAP_ROOMS_API_URL: "http://127.0.0.1:5222/api/rooms",
      SITEMAP_REQUIRE_ROOMS_API: "true",
      AI_CRAWLER_POLICY: "search-only",
    }),
    /must use HTTPS/,
  );
});

test("sitemap generation rejects a room response from the wrong API environment", async () => {
  await assert.rejects(
    fetchPublishedRooms({
      apiUrl: "https://api.moorehotelandsuites.com/api/rooms",
      required: true,
      attempts: 1,
      apiEnvironment: "production",
      fetchImplementation: async () => ({
        ok: true,
        status: 200,
        headers: { get: () => "local" },
        json: async () => [{ id: ROOM_ONE }],
      }),
    }),
    /environment mismatch/,
  );
});
