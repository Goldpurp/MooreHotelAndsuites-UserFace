import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { LOGO_URL, SOCIAL_IMAGE, SOCIAL_IMAGE_ALT } from "../scripts/seo-routes.mjs";

test("static page and component media no longer requests Cloudinary or the removed photograph", async () => {
  for (const directory of ["pages", "components"]) {
    for (const file of await readdir(directory)) {
      if (!file.endsWith(".tsx")) continue;
      const source = await readFile(`${directory}/${file}`, "utf8");
      assert.doesNotMatch(source, /https:\/\/res\.cloudinary\.com\//, file);
      assert.doesNotMatch(source, /Screenshot_2026-08-02_at_8\.39\.54_pm_rggvsx/, file);
    }
  }
});

test("the existing hotel video is preserved as an R2 MP4 without the broken poster", async () => {
  const source = await readFile("pages/Home.tsx", "utf8");
  assert.match(source, /https:\/\/media\.moorehotelandsuites\.com\/IMG_1221_jtnwy1-web\.mp4/);
  assert.doesNotMatch(source, /poster=/);
});

test("both production policies allow the custom media domain and keep legacy delivery during rollout", async () => {
  for (const file of ["render.yaml", "public/_headers"]) {
    const source = await readFile(file, "utf8");
    for (const directive of ["img-src", "media-src"]) {
      const policy = source.match(new RegExp(`${directive}[^;]+`))?.[0] ?? "";
      assert.match(policy, /https:\/\/media\.moorehotelandsuites\.com/);
      assert.match(policy, /https:\/\/res\.cloudinary\.com/);
    }
    assert.doesNotMatch(source, /\.r2\.dev/);
  }
});

test("social metadata uses the existing original logo instead of a missing photograph", () => {
  assert.equal(SOCIAL_IMAGE, LOGO_URL);
  assert.equal(new URL(LOGO_URL).origin, "https://media.moorehotelandsuites.com");
  assert.match(LOGO_URL, /-original$/);
  assert.equal(SOCIAL_IMAGE_ALT, "Moore Hotels & Suites logo");
});
