import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const googleHotelEntity =
  "https://www.google.com.ng/travel/hotels/Ikenne/entity/ChkIypeh7a3txq8BGg0vZy8xMXJfZHJ0MjVzEAE/overview";

test("hotel search data links the verified Google entity and matching Sagamu address", async () => {
  const [seo, html] = await Promise.all([
    readFile(new URL("../public/seo.js", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  ]);

  assert.match(seo, /alternateName: "Moore Hotels and Suites"/);
  const sameAsMatch = seo.match(/sameAs:\s*\[\s*"([^"]+)"/);
  assert.ok(sameAsMatch);
  assert.equal(sameAsMatch[1], googleHotelEntity);
  assert.match(seo, /streetAddress: "After Stadium, Harmony Estate, Along Ikenne Road"/);
  assert.match(seo, /addressLocality: "Sagamu"/);
  assert.match(seo, /addressRegion: "Ogun State"/);
  assert.match(seo, /postalCode: "121103"/);
  assert.doesNotMatch(seo, /postalCode: "121101"/);

  assert.match(html, /<script type="application\/ld\+json" id="moore-hotel-structured-data">/);
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json" id="moore-hotel-structured-data">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLdMatch);
  const hotel = JSON.parse(jsonLdMatch[1])["@graph"].find(
    (entry) => entry["@type"] === "Hotel",
  );
  assert.equal(hotel.sameAs[0], googleHotelEntity);
  assert.match(html, /"streetAddress": "After Stadium, Harmony Estate, Along Ikenne Road"/);
  assert.match(html, /"addressLocality": "Sagamu"/);
  assert.match(html, /"addressRegion": "Ogun State"/);
  assert.match(html, /"postalCode": "121103"/);
});

test("public location copy matches the Google hotel profile", async () => {
  const files = await Promise.all([
    readFile(new URL("../components/Footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../pages/Home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../pages/Privacy.tsx", import.meta.url), "utf8"),
  ]);
  const publicLocationCopy = files.join("\n");

  assert.match(publicLocationCopy, /After Stadium/);
  assert.match(publicLocationCopy, /Harmony Estate/);
  assert.match(publicLocationCopy, /Sagamu 121103/);
  assert.doesNotMatch(publicLocationCopy, /Sagamu[–-]Ikenne Road, beside NYSC Camp/);
});
