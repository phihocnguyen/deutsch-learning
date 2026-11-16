import test from "node:test";
import assert from "node:assert/strict";
import { parseCustomVocabulary, validateTopicName } from "../lib/custom-vocabulary.ts";
import { parseProgress } from "../lib/progress.ts";

const id = "custom-12345678-1234-4123-8123-123456789abc";
const data = { version: 1, topics: [{ id: "travel", name: "Du lịch" }], words: [{ id, topicId: "travel", topic: "stale name", german: "Bahnhof", article: "der", plural: "Bahnhöfe", vietnamese: "Nhà ga", example: "Der Bahnhof ist groß.", translation: "Nhà ga lớn." }] };
test("custom cards round-trip with their owning topic and separate progress", () => {
  const parsed = parseCustomVocabulary(JSON.stringify(data));
  assert.equal(parsed.words[0].topic, "Du lịch");
  assert.equal(parsed.words[0].plural, "Bahnhöfe");
  assert.deepEqual(parseProgress(JSON.stringify({ version: 1, words: { [id]: "known", haus: "review" } })).words, { haus: "review", [id]: "known" });
});
test("duplicate topics, orphan cards, malformed fields and built-in ID collisions are rejected", () => {
  for (const invalid of [
    { ...data, topics: [...data.topics, { id: "other", name: " du lịch " }] },
    { ...data, topics: [] },
    { ...data, words: [{ ...data.words[0], id: "haus" }] },
    { ...data, words: [{ ...data.words[0], german: " " }] },
    { ...data, words: [{ ...data.words[0], article: "dem" }] },
    { ...data, words: [...data.words, ...data.words] },
    { version: 2, topics: [], words: [] },
  ]) assert.throws(() => parseCustomVocabulary(JSON.stringify(invalid)));
  assert.throws(() => validateTopicName("Nhà cửa", data));
  assert.deepEqual(parseCustomVocabulary(null), { version: 1, topics: [], words: [] });
});
