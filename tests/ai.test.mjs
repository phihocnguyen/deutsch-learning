import test from "node:test";
import assert from "node:assert/strict";
import { parseExample, parseScore } from "../lib/ai-results.ts";

test("AI examples require both German and Vietnamese sentences", () => {
  assert.deepEqual(parseExample({ example_de: " Die Tür ist offen. ", example_vi: "Cửa đang mở." }), { example: "Die Tür ist offen.", translation: "Cửa đang mở." });
  for (const value of [null, {}, { example_de: "Hallo" }, { example: "", translation: "Xin chào" }, { example: "x".repeat(1001), translation: "a" }]) assert.throws(() => parseExample(value));
});

test("pronunciation scores are finite numbers on the 0–100 scale", () => {
  assert.equal(parseScore({ score: 0 }), 0);
  assert.equal(parseScore({ score: 100 }), 100);
  assert.equal(parseScore({ score: 85.32 }), 85.3);
  for (const score of [-1, 101, NaN, Infinity, "90", null]) assert.throws(() => parseScore({ score }));
  assert.throws(() => parseScore({}));
});
