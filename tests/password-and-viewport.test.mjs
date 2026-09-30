import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("password reset reads the fragment contract and submits the user id", async () => {
  const [page, api] = await Promise.all([
    readFile("pages/ResetPassword.tsx", "utf8"),
    readFile("services/api.ts", "utf8"),
  ]);

  assert.match(page, /window\.location\.hash\.slice\(1\)/);
  assert.match(page, /userId: params\.get\("userId"\)/);
  assert.match(page, /userId: resetParameters\.userId/);
  assert.doesNotMatch(page, /window\.location\.search/);
  assert.match(api, /resetPassword = async \(data: \{\s*userId: string;/);
});

test("reset and account-security password fields have accessible visibility controls", async () => {
  const [input, reset, profile] = await Promise.all([
    readFile("components/ui/PasswordInput.tsx", "utf8"),
    readFile("pages/ResetPassword.tsx", "utf8"),
    readFile("pages/Profile.tsx", "utf8"),
  ]);

  assert.match(input, /aria-label=\{visible \? "Hide password" : "Show password"\}/);
  assert.match(input, /aria-pressed=\{visible\}/);
  assert.equal((reset.match(/<PasswordInput/g) || []).length, 2);
  assert.match(profile, /<PasswordInput/);
});

test("the document root clips accidental horizontal overflow without narrowing page content", async () => {
  const css = await readFile("index.css", "utf8");
  assert.match(css, /html \{[\s\S]*overflow-x: clip;[\s\S]*overscroll-behavior-x: none/);
  assert.match(css, /body \{[\s\S]*min-width: 0;[\s\S]*overscroll-behavior-x: none/);
  assert.match(css, /#root \{[\s\S]*min-width: 0;[\s\S]*overflow-x: clip/);
});

test("full-height guest screens use the stable dynamic mobile viewport", async () => {
  const paths = [
    "App.tsx",
    "pages/Auth.tsx",
    "pages/ResetPassword.tsx",
    "pages/Checkout.tsx",
    "pages/Profile.tsx",
  ];
  for (const path of paths) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(source, /\bmin-h-screen\b/, path);
  }
});
