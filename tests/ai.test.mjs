import test from "node:test";
import assert from "node:assert/strict";
import { parseExample } from "../lib/ai-results.ts";

test("AI examples require both German and Vietnamese sentences", () => {
  assert.deepEqual(parseExample({ example_de: " Die Tür ist offen. ", example_vi: "Cửa đang mở." }), { example: "Die Tür ist offen.", translation: "Cửa đang mở." });
  for (const value of [null, {}, { example_de: "Hallo" }, { example: "", translation: "Xin chào" }, { example: "x".repeat(1001), translation: "a" }]) assert.throws(() => parseExample(value));
});
