import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../utils/guestCounts.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { parseGuestCounts, initialGuestCounts } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

test("count fields keep raw editable text and request a mobile numeric keyboard", async () => {
  const form = await readFile(new URL("../pages/Checkout.tsx", import.meta.url), "utf8");
  assert.equal((form.match(/inputMode="numeric"/g) || []).length, 2);
  assert.doesNotMatch(form, /Math\.max\([01], Number\((?:event|e)\.target\.value\)/);
  assert.match(form, /if \(!validGuestCounts/);
});

test("counts can be cleared and replaced without accepting an empty booking count", () => {
  assert.equal(parseGuestCounts("1", "0").validGuestCounts, true);
  assert.equal(parseGuestCounts("", "0").validGuestCounts, false);
  assert.equal(parseGuestCounts("2", "0").adultCount, 2);
  assert.equal(parseGuestCounts("2", "").validGuestCounts, false);
  assert.deepEqual(parseGuestCounts("2", "1"), { adultCount: 2, childCount: 1, validGuestCounts: true });
});

test("counts reject fractions, negatives, missing values and values outside the API limits", () => {
  for (const [adults, children] of [["0", "0"], ["-1", "0"], ["1.5", "0"], ["1", "0.5"], ["21", "0"], ["1", "21"], ["1", "-1"], [" ", "0"], ["abc", "0"]]) {
    assert.equal(parseGuestCounts(adults, children).validGuestCounts, false);
  }
  assert.equal(parseGuestCounts("20", "0").validGuestCounts, true);
});

test("checkout preserves selected search occupancy and does not coerce invalid counts", () => {
  assert.deepEqual(initialGuestCounts(new URLSearchParams("guests=2")), {adults:"2",children:"0"});
  assert.deepEqual(initialGuestCounts(new URLSearchParams("guests=4&adultCount=2&childCount=2")), {adults:"2",children:"2"});
  for (const value of ["", "0", "1.5", "21", "no"]) {
    const counts=initialGuestCounts(new URLSearchParams("guests="+value));
    assert.equal(parseGuestCounts(counts.adults, counts.children).validGuestCounts, false);
  }
});
