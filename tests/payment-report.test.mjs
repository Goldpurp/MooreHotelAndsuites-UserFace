import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('inventory is reserved before bank details, then the transfer is explicitly reported', async () => {
  const checkout = await read('pages/Checkout.tsx');
  assert.match(checkout, /paymentReported: false/);
  assert.match(checkout, /const booking = await createBooking\(quote\);[\s\S]*setDirectTransferBooking\(booking\);[\s\S]*setCurrentStep\(3\)/);
  assert.match(checkout, /await api.reportTransfer\(directTransferBooking.bookingCode, accessToken/);
  assert.match(checkout, /Do not initiate a new transfer/);
  assert.match(checkout, /disabled=\{processing \|\| Boolean\(directTransferBooking\)\}/);
  assert.match(checkout, /does not mark the payment as verified/);
  assert.match(checkout, /Do not send the transfer again/);
  assert.match(await read('types.ts'), /PaymentReported = "PaymentReported"/);
});

test('existing reservations can report a transfer using their secure booking access', async () => {
  const api = await read('services/api.ts');
  assert.match(api, /report-transfer/);
  assert.match(api, /JSON.stringify\(\{ guestAccessToken \}\)/);
  const page = await read('pages/BookingConfirmation.tsx');
  assert.match(page, /api.reportTransfer\(booking.bookingCode, guestAccessToken/);
  assert.match(page, /a room is not guaranteed yet/);
});
