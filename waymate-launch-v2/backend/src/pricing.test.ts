import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCommission, estimateSeatFare, PLATFORM_COMMISSION_RATE } from './pricing.js';

test('car fare estimate combines distance and duration and returns a bounded range', () => {
  const fare = estimateSeatFare('CAR', 20, 45);
  assert.equal(fare.suggested, 115);
  assert.equal(fare.minimum, 85);
  assert.equal(fare.maximum, 175);
  assert.equal(fare.perSeat, true);
});

test('bike fare estimate uses the bike-specific rates', () => {
  assert.equal(estimateSeatFare('BIKE', 20, 45).suggested, 70);
});

test('platform commission is rounded to paise at the configured 12 percent rate', () => {
  assert.equal(PLATFORM_COMMISSION_RATE, 0.12);
  assert.equal(calculateCommission(100.05), 12.01);
  assert.equal(calculateCommission(0), 0);
});
