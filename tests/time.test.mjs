import test from "node:test";
import assert from "node:assert/strict";
import { germanClockReadings, germanTimeNumber } from "../lib/grammar/time.ts";
test("quarter, half and offsets refer to the correct current or next hour", () => {
  for (const [minute, expected] of [[5, "fünf nach sieben"], [15, "Viertel nach sieben"], [25, "fünf vor halb acht"], [30, "halb acht"], [35, "fünf nach halb acht"], [45, "Viertel vor acht"], [55, "fünf vor acht"]]) assert.equal(germanClockReadings(7, minute).informal, expected);
});
test("24-hour readings and noon/midnight wrapping are consistent", () => {
  assert.equal(germanClockReadings(14, 15).formal, "vierzehn Uhr fünfzehn");
  assert.equal(germanClockReadings(14, 15).informal, "Viertel nach zwei");
  assert.equal(germanClockReadings(12, 30).informal, "halb eins");
  assert.equal(germanClockReadings(23, 45).informal, "Viertel vor zwölf");
  assert.equal(germanClockReadings(1, 0).formal, "ein Uhr");
  assert.equal(germanClockReadings(0, 0).formal, "null Uhr");
});
test("time numbers preserve German composition and invalid values are rejected", () => {
  assert.equal(germanTimeNumber(21), "einundzwanzig"); assert.equal(germanTimeNumber(35), "fünfunddreißig");
  for (const value of [-1, 60, 1.5, NaN]) assert.throws(() => germanTimeNumber(value));
  for (const [hour, minute] of [[24, 0], [-1, 5], [7, 60], [7, -1]]) assert.throws(() => germanClockReadings(hour, minute));
});
