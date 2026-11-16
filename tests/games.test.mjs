import test from "node:test";
import assert from "node:assert/strict";
import { vocabulary, topics } from "./fixtures/vocabulary.ts";
import { createDeck as buildDeck, makeChoices, recordAnswer, shuffle, isSpellingCorrect, letterTiles } from "../lib/games.ts";
const createDeck = (topic, limit) => buildDeck(topic, limit, vocabulary);
test("deck respects topic, caps round size and supports an empty pool", () => {
  for (const topic of topics) { const deck = createDeck(topic); assert.equal(deck.length, 5); assert.ok(deck.every(w => w.topic === topic)); assert.equal(new Set(deck.map(w => w.id)).size, 5); }
  assert.deepEqual(createDeck("missing"), []);
});
test("choices include exactly one answer and work with a tiny vocabulary", () => {
  const word = vocabulary[0]; const choices = makeChoices(word, vocabulary);
  assert.equal(choices.length, 4); assert.equal(new Set(choices.map(w => w.id)).size, 4);
  assert.equal(choices.filter(w => w.id === word.id).length, 1);
  assert.deepEqual(makeChoices(word, [word]), [word]);
});
test("score cannot be increased or overwritten by repeated submissions", () => {
  const first = recordAnswer({}, "haus", false);
  assert.equal(recordAnswer(first, "haus", true), first);
  assert.deepEqual(recordAnswer(first, "apfel", true), { haus: false, apfel: true });
});
test("spelling accepts normalized German and case but preserves umlaut and sharp s", () => {
  const tur = vocabulary.find(w => w.id === "tur");
  assert.ok(isSpellingCorrect("  TU\u0308R ", tur)); assert.equal(isSpellingCorrect("Tur", tur), false);
  const tschuss = vocabulary.find(w => w.id === "tschuss");
  assert.ok(isSpellingCorrect("tschüss", tschuss)); assert.equal(isSpellingCorrect("tschuss", tschuss), false);
});
test("tiles preserve repeated letters, spaces and umlauts without starting solved", () => {
  for (const word of vocabulary) { const tiles = letterTiles(word); assert.deepEqual([...tiles].sort(), Array.from(word.german).sort()); assert.notEqual(tiles.join(""), word.german); }
  const source = [1, 2, 3]; assert.deepEqual(shuffle(source, () => 0).sort(), source); assert.deepEqual(source, [1, 2, 3]);
});
