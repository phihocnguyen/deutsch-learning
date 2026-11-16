import test from "node:test";
import assert from "node:assert/strict";
import { parseProgress } from "../lib/progress.ts";
import { vocabulary, topics, fullWord, fullPlural } from "./fixtures/vocabulary.ts";

test("fresh progress and persisted known/review status round-trip", () => {
  assert.deepEqual(parseProgress(null), { version: 1, words: {} });
  const progress = { version: 1, words: { apfel: "known", haus: "review" } };
  assert.deepEqual(parseProgress(JSON.stringify(progress)), progress);
});
test("corrupt, wrong-version and malformed storage is rejected", () => {
  for (const raw of ["{", "null", '{"version":2,"words":{}}', '{"version":1,"words":[]}', '{"version":1,"words":null}']) assert.throws(() => parseProgress(raw));
});
test("unrecognized words and invalid statuses cannot inflate progress", () => {
  assert.deepEqual(parseProgress(JSON.stringify({ version: 1, words: { apfel: "known", invented: "known", haus: "wrong" } })).words, { apfel: "known" });
});
test("vocabulary has unique identifiers, complete noun forms and five populated topics", () => {
  assert.equal(new Set(vocabulary.map(w => w.id)).size, vocabulary.length);
  for (const topic of topics) assert.ok(vocabulary.filter(w => w.topic === topic).length >= 5);
  for (const word of vocabulary) { assert.ok(word.example && word.translation && word.vietnamese); if (word.article) assert.ok(word.plural); }
});
test("pronunciation text includes noun articles and preserves German characters", () => {
  assert.equal(fullWord(vocabulary.find(w => w.id === "haus")), "das Haus");
  assert.equal(fullWord(vocabulary.find(w => w.id === "tur")), "die Tür");
  assert.equal(fullWord(vocabulary.find(w => w.id === "tschuss")), "tschüss");
  assert.equal(fullPlural(vocabulary.find(w => w.id === "haus")), "die Häuser");
  assert.equal(fullPlural(vocabulary.find(w => w.id === "fenster")), "die Fenster");
  assert.equal(fullPlural(vocabulary.find(w => w.id === "wasser")), undefined);
  assert.equal(fullPlural(vocabulary.find(w => w.id === "lernen")), undefined);
});
