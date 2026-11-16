import test from "node:test";
import assert from "node:assert/strict";
import { parseProgress } from "../lib/progress.ts";
import { vocabulary, topics } from "../lib/vocabulary.ts";
import { readFile } from "node:fs/promises";

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
test("every native recording has source, license and valid local Ogg bytes", async () => {
  const manifest = JSON.parse(await readFile(new URL("../lib/audio-manifest.json", import.meta.url)));
  assert.ok(Object.keys(manifest).length >= 10);
  for (const [id, recording] of Object.entries(manifest)) {
    assert.ok(vocabulary.some(w => w.id === id));
    assert.match(recording.source, /^https:\/\/commons.wikimedia.org\//);
    assert.match(recording.licenseUrl, /^https:\/\/creativecommons.org\//);
    assert.ok(recording.author && recording.description && recording.modified === false);
    const bytes = await readFile(new URL(`../public${recording.src}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "OggS");
  }
});
