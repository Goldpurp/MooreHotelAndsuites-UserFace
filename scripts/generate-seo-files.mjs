import { randomUUID } from "node:crypto";
import { readFile, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  LOGO_URL,
  PRIVATE_ROUTE_METADATA,
  PRIVATE_ROUTE_PREFIXES,
  PUBLIC_ROUTE_METADATA,
  PUBLIC_ROUTES,
  SITE_NAME,
  SOCIAL_IMAGE,
  SOCIAL_IMAGE_ALT,
} from "./seo-routes.mjs";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, "public");
const MAX_SITEMAP_URLS = 50_000;
const MAX_SITEMAP_BYTES = 50 * 1024 * 1024;
const MAX_ROBOTS_BYTES = 500 * 1024;
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export { PRIVATE_ROUTE_PREFIXES, PUBLIC_ROUTES } from "./seo-routes.mjs";

export const AI_CRAWLER_POLICIES = Object.freeze([
  "search-only",
  "allow-all",
  "block-all",
]);

const MAINSTREAM_SEARCH_AGENTS = Object.freeze([
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
]);

const AI_SEARCH_AND_USER_AGENTS = Object.freeze([
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]);

const AI_TRAINING_AGENTS = Object.freeze([
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Applebot-Extended",
]);

function parseEnvironmentFile(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
          value.length >= 2 &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      }),
  );
}

function parseBoolean(value, name, fallback) {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be either true or false.`);
}

function normalizeSiteUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL.");
  }

  if (url.protocol !== "https:") throw new Error("SITE_URL must use HTTPS.");
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("SITE_URL cannot contain credentials, a query, or a fragment.");
  }
  if (url.pathname !== "/") {
    throw new Error("SITE_URL must be the site origin without a path.");
  }
  return url.origin;
}

function normalizeRoomsApiUrl(value, mode) {
  if (!value) return null;

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SITEMAP_ROOMS_API_URL must be a valid absolute URL.");
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("SITEMAP_ROOMS_API_URL must use HTTP or HTTPS.");
  }
  if (mode === "production" && url.protocol !== "https:") {
    throw new Error("Production SITEMAP_ROOMS_API_URL must use HTTPS.");
  }
  if (mode === "production" && LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error("Production SITEMAP_ROOMS_API_URL cannot target a local API.");
  }
  if (mode === "localhost" && !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error("Local SITEMAP_ROOMS_API_URL must target a loopback API.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "SITEMAP_ROOMS_API_URL cannot contain credentials, a query, or a fragment.",
    );
  }
  return url.toString();
}

export async function loadSeoConfig(mode, environment = process.env) {
  const profileFiles = {
    localhost: ".env.localhost",
    production: ".env.production",
  };
  const profileFile = profileFiles[mode];
  if (!profileFile) {
    throw new Error("SEO generation mode must be localhost or production.");
  }

  const fileEnvironment = parseEnvironmentFile(
    await readFile(path.join(PROJECT_ROOT, profileFile), "utf8"),
  );
  const values = { ...fileEnvironment, ...environment };
  const siteUrl = normalizeSiteUrl(
    values.SITE_URL || "https://moorehotelandsuites.com",
  );
  const roomsApiUrl = normalizeRoomsApiUrl(
    values.SITEMAP_ROOMS_API_URL?.trim(),
    mode,
  );
  const requireRoomsApi = parseBoolean(
    values.SITEMAP_REQUIRE_ROOMS_API,
    "SITEMAP_REQUIRE_ROOMS_API",
    mode === "production",
  );
  const aiCrawlerPolicy = values.AI_CRAWLER_POLICY || "search-only";

  if (!AI_CRAWLER_POLICIES.includes(aiCrawlerPolicy)) {
    throw new Error(
      `AI_CRAWLER_POLICY must be one of: ${AI_CRAWLER_POLICIES.join(", ")}.`,
    );
  }
  if (requireRoomsApi && !roomsApiUrl) {
    throw new Error(
      "SITEMAP_ROOMS_API_URL is required when SITEMAP_REQUIRE_ROOMS_API=true.",
    );
  }

  return {
    mode,
    siteUrl,
    roomsApiUrl,
    requireRoomsApi,
    aiCrawlerPolicy,
  };
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function extractRoomArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return payload.data;
  }
  throw new Error("room catalogue response is not a JSON array");
}

export async function fetchPublishedRooms({
  apiUrl,
  required,
  fetchImplementation = fetch,
  attempts = 3,
  timeoutMs = 10_000,
  wait = sleep,
  apiEnvironment = "production",
}) {
  if (!apiUrl) return [];

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImplementation(apiUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "MooreHotels-SitemapGenerator/1.0",
          "X-Moore-App-Environment": "production",
        },
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`room catalogue returned HTTP ${response.status}`);
      }
      const responseEnvironment = response.headers
        ?.get?.("X-Moore-API-Environment")
        ?.trim()
        .toLowerCase();
      if (responseEnvironment && responseEnvironment !== apiEnvironment) {
        throw new Error(
          `room catalogue environment mismatch: expected ${apiEnvironment}, received ${responseEnvironment}`,
        );
      }

      const rooms = extractRoomArray(await response.json());
      for (const room of rooms) {
        const roomId = String(room?.id ?? "").trim();
        if (!room || typeof room !== "object" || !roomId) {
          throw new Error("room catalogue contains an entry without an id");
        }
        if (!GUID_PATTERN.test(roomId)) {
          throw new Error("room catalogue contains a non-GUID id");
        }
      }
      return rooms;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(attempt * 250);
    } finally {
      clearTimeout(timeout);
    }
  }

  const reason = lastError?.name === "AbortError"
    ? "request timed out"
    : lastError?.message || "unknown error";
  if (required) {
    throw new Error(`Unable to generate the room sitemap: ${reason}.`);
  }
  console.warn(`Room URLs omitted from the sitemap: ${reason}.`);
  return [];
}

function isPrivatePath(pathname) {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function toLastModifiedDate(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function createSitemapEntries(siteUrl, rooms = []) {
  const canonicalOrigin = normalizeSiteUrl(siteUrl);
  const entriesByUrl = new Map();

  for (const route of PUBLIC_ROUTES) {
    const loc = new URL(route, `${canonicalOrigin}/`).toString();
    entriesByUrl.set(loc, { loc, lastmod: null });
  }

  const sortedRooms = [...rooms].sort((left, right) =>
    String(left.id).localeCompare(String(right.id)),
  );
  for (const room of sortedRooms) {
    const roomId = String(room.id ?? "").trim();
    if (!roomId) throw new Error("A sitemap room entry is missing its id.");
    if (!GUID_PATTERN.test(roomId)) {
      throw new Error("A sitemap room entry has a non-GUID id.");
    }
    const roomPath = `/rooms/${encodeURIComponent(roomId)}`;
    const loc = new URL(roomPath, `${canonicalOrigin}/`).toString();
    entriesByUrl.set(loc, {
      loc,
      lastmod: toLastModifiedDate(
        room.updatedAt ?? room.modifiedAt ?? room.lastModifiedAt,
      ),
    });
  }

  const entries = [...entriesByUrl.values()];
  if (entries.length > MAX_SITEMAP_URLS) {
    throw new Error(
      `Sitemap has ${entries.length} URLs; the protocol limit is ${MAX_SITEMAP_URLS}.`,
    );
  }

  for (const entry of entries) {
    const pathname = new URL(entry.loc).pathname;
    if (isPrivatePath(pathname)) {
      throw new Error(`Private workflow URL cannot appear in the sitemap: ${pathname}`);
    }
  }
  return entries;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function unescapeXml(value) {
  return value
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

export function createSitemapXml(entries) {
  const rows = entries.map(({ loc, lastmod }) => {
    const lastModifiedRow = lastmod
      ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>`
      : "";
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastModifiedRow}\n  </url>`;
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    "</urlset>",
    "",
  ].join("\n");

  if (Buffer.byteLength(xml, "utf8") > MAX_SITEMAP_BYTES) {
    throw new Error("Generated sitemap exceeds the 50 MB protocol limit.");
  }
  return xml;
}

function renderAgentGroup(agents, directive) {
  return [
    ...agents.map((agent) => `User-agent: ${agent}`),
    `${directive}: /`,
  ].join("\n");
}

export function createRobotsTxt(siteUrl, aiCrawlerPolicy = "search-only") {
  const canonicalOrigin = normalizeSiteUrl(siteUrl);
  if (!AI_CRAWLER_POLICIES.includes(aiCrawlerPolicy)) {
    throw new Error(`Unsupported AI crawler policy: ${aiCrawlerPolicy}.`);
  }

  const sections = [
    "# Moore Hotels & Suites public guest website",
    renderAgentGroup(MAINSTREAM_SEARCH_AGENTS, "Allow"),
    [
      "# Private workflows use page-level noindex directives. They remain crawlable",
      "# so compliant search engines can read and enforce those directives.",
      "User-agent: *",
      "Allow: /",
    ].join("\n"),
  ];

  if (aiCrawlerPolicy === "search-only") {
    sections.push(
      ["# AI search and user-requested retrieval", renderAgentGroup(AI_SEARCH_AND_USER_AGENTS, "Allow")].join("\n"),
      ["# Automated AI model-training collection", renderAgentGroup(AI_TRAINING_AGENTS, "Disallow")].join("\n"),
    );
  } else {
    const directive = aiCrawlerPolicy === "allow-all" ? "Allow" : "Disallow";
    sections.push(
      [
        `# AI crawler policy: ${aiCrawlerPolicy}`,
        renderAgentGroup(
          [...AI_SEARCH_AND_USER_AGENTS, ...AI_TRAINING_AGENTS],
          directive,
        ),
      ].join("\n"),
    );
  }

  sections.push(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
  const robots = `${sections.join("\n\n")}\n`;
  if (Buffer.byteLength(robots, "utf8") > MAX_ROBOTS_BYTES) {
    throw new Error("Generated robots.txt exceeds 500 KiB.");
  }
  return robots;
}

export function createSeoDataScript(siteUrl) {
  const payload = {
    siteName: SITE_NAME,
    siteUrl: normalizeSiteUrl(siteUrl),
    socialImage: SOCIAL_IMAGE,
    socialImageAlt: SOCIAL_IMAGE_ALT,
    logoUrl: LOGO_URL,
    publicRouteMeta: PUBLIC_ROUTE_METADATA,
    privateRouteMeta: PRIVATE_ROUTE_METADATA,
    privateRoutePrefixes: PRIVATE_ROUTE_PREFIXES,
  };
  return `window.MooreSeoData = ${JSON.stringify(payload).replaceAll("<", "\\u003c")};\n`;
}

export function validateSitemapXml(xml, siteUrl) {
  const canonicalOrigin = normalizeSiteUrl(siteUrl);
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error("Sitemap is missing its UTF-8 XML declaration.");
  }
  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    throw new Error("Sitemap is missing the sitemap protocol namespace.");
  }

  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    unescapeXml(match[1]),
  );
  const urlNodes = [...xml.matchAll(/<url>/g)].length;
  if (locations.length === 0 || locations.length !== urlNodes) {
    throw new Error("Every sitemap URL node must contain exactly one location.");
  }
  if (locations.length > MAX_SITEMAP_URLS) {
    throw new Error("Sitemap exceeds the 50,000 URL protocol limit.");
  }
  if (new Set(locations).size !== locations.length) {
    throw new Error("Sitemap contains duplicate URLs.");
  }

  for (const location of locations) {
    const url = new URL(location);
    if (url.origin !== canonicalOrigin || url.protocol !== "https:") {
      throw new Error(`Sitemap URL is outside the canonical HTTPS origin: ${location}`);
    }
    if (url.search || url.hash || isPrivatePath(url.pathname)) {
      throw new Error(`Sitemap URL is non-canonical or private: ${location}`);
    }
  }

  for (const route of PUBLIC_ROUTES) {
    const expected = new URL(route, `${canonicalOrigin}/`).toString();
    if (!locations.includes(expected)) {
      throw new Error(`Sitemap is missing required public route ${route}.`);
    }
  }

  for (const match of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1])) {
      throw new Error(`Invalid sitemap lastmod value: ${match[1]}.`);
    }
  }
  return { urlCount: locations.length, locations };
}

export function validateRobotsTxt(robots, siteUrl, aiCrawlerPolicy) {
  const canonicalOrigin = normalizeSiteUrl(siteUrl);
  if (Buffer.byteLength(robots, "utf8") > MAX_ROBOTS_BYTES) {
    throw new Error("robots.txt exceeds 500 KiB.");
  }
  if (!robots.includes("User-agent: *\nAllow: /")) {
    throw new Error("robots.txt must allow the public website by default.");
  }
  const sitemapLines = robots
    .split(/\r?\n/)
    .filter((line) => line.startsWith("Sitemap:"));
  if (
    sitemapLines.length !== 1 ||
    sitemapLines[0] !== `Sitemap: ${canonicalOrigin}/sitemap.xml`
  ) {
    throw new Error("robots.txt must reference the canonical sitemap exactly once.");
  }

  const expected = createRobotsTxt(canonicalOrigin, aiCrawlerPolicy);
  if (robots !== expected) {
    throw new Error("robots.txt does not match the configured crawler policy.");
  }
  return true;
}

async function writeFilesAtomically(directory, files) {
  await mkdir(directory, { recursive: true });
  const pending = [];

  for (const [filename, contents] of Object.entries(files)) {
    const destination = path.join(directory, filename);
    const temporary = `${destination}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, contents, { encoding: "utf8", mode: 0o644 });
    pending.push({ temporary, destination });
  }
  for (const file of pending) await rename(file.temporary, file.destination);
}

export async function generateSeoFiles(config) {
  const rooms = await fetchPublishedRooms({
    apiUrl: config.roomsApiUrl,
    required: config.requireRoomsApi,
    apiEnvironment: config.mode === "localhost" ? "local" : "production",
  });
  const entries = createSitemapEntries(config.siteUrl, rooms);
  const sitemap = createSitemapXml(entries);
  const robots = createRobotsTxt(config.siteUrl, config.aiCrawlerPolicy);
  const seoData = createSeoDataScript(config.siteUrl);

  validateSitemapXml(sitemap, config.siteUrl);
  validateRobotsTxt(robots, config.siteUrl, config.aiCrawlerPolicy);
  await writeFilesAtomically(PUBLIC_DIRECTORY, {
    "sitemap.xml": sitemap,
    "robots.txt": robots,
    "seo-data.js": seoData,
  });
  await writeFilesAtomically(path.join(PROJECT_ROOT, ".seo-cache"), {
    "rooms.json": `${JSON.stringify(rooms)}\n`,
  });

  return { roomCount: rooms.length, urlCount: entries.length };
}

function readModeArgument(argv) {
  const inline = argv.find((value) => value.startsWith("--mode="));
  if (inline) return inline.slice("--mode=".length);
  const index = argv.indexOf("--mode");
  return index >= 0 ? argv[index + 1] : "production";
}

async function main() {
  const mode = readModeArgument(process.argv.slice(2));
  const config = await loadSeoConfig(mode);
  const result = await generateSeoFiles(config);
  console.log(
    `Generated sitemap.xml (${result.urlCount} URLs, ${result.roomCount} rooms) and robots.txt (${config.aiCrawlerPolicy}).`,
  );
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  main().catch((error) => {
    console.error(`SEO generation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
