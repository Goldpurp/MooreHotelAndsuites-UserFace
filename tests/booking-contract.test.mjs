import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("guest booking uses the hardened API contract", async () => {
  const [api, checkout, confirmation, helpCenter, environment, types, app] = await Promise.all([
    read("services/api.ts"),
    read("pages/Checkout.tsx"),
    read("pages/BookingConfirmation.tsx"),
    read("pages/HelpCenter.tsx"),
    read("config/environment.ts"),
    read("types.ts"),
    read("App.tsx"),
  ]);

  assert.match(api, /"\/bookings\/lookup"[\s\S]*method: "POST"/);
  assert.match(api, /X-Booking-Access-Token/);
  assert.match(checkout, /adultCount/);
  assert.match(checkout, /childCount/);
  assert.match(checkout, /acceptPrivacyPolicy: acceptedPolicies/);
  assert.match(checkout, /acceptBookingTerms: acceptedPolicies/);
  assert.match(api, /"\/pricing\/quotes"[\s\S]*method: "POST"/);
  assert.match(checkout, /api\.createPricingQuote/);
  assert.match(checkout, /quoteId: quote\.quoteId/);
  assert.match(checkout, /quoteToken: quote\.quoteToken/);
  assert.match(checkout, /pricingQuote\.totalAmount/);
  assert.match(checkout, /The stay price changed while you were checking out/);
  assert.match(checkout, /pricing quote\|after pricing\|new quote/);
  assert.match(checkout, /paymentMethod: PaymentMethod\.DirectTransfer/);
  assert.doesNotMatch(checkout, /PaymentMethod\.Monnify/);
  assert.doesNotMatch(checkout, /getTrustedPaymentUrl/);
  assert.doesNotMatch(
    [api, checkout, confirmation, helpCenter, environment, types].join("\n"),
    /monnify/i,
  );
  assert.doesNotMatch(checkout, /requestBookingEmailVerification/);
  assert.doesNotMatch(checkout, /emailVerificationToken/);
  assert.doesNotMatch(api, /\/bookings\/verification\/request/);
  assert.doesNotMatch(api, /emailVerificationToken/);
  assert.doesNotMatch(app, /path="\/book"/);
});

test("guest account exposes privacy export and request history", async () => {
  const [api, profile] = await Promise.all([
    read("services/api.ts"),
    read("pages/Profile.tsx"),
  ]);

  assert.match(api, /"\/privacy\/export"/);
  assert.match(api, /"\/privacy\/requests\/mine"/);
  assert.match(api, /"\/privacy\/requests"/);
  assert.match(profile, /Download your data/);
  assert.match(profile, /Privacy requests/);
});
