import { type Word } from "./vocabulary.ts";
export type GameMode = "match" | "meaning" | "listen" | "letters";
export type Answers = Record<string, boolean>;
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function createDeck(topic: string, limit = 5, vocabulary: Word[] = []) { return shuffle(vocabulary.filter(w => !topic || w.topic === topic)).slice(0, Math.max(0, limit)); }
export function makeChoices(word: Word, pool: Word[]) { return shuffle([word, ...shuffle(pool.filter(w => w.id !== word.id)).slice(0, 3)]); }
export function recordAnswer(answers: Answers, id: string, correct: boolean): Answers { return Object.hasOwn(answers, id) ? answers : { ...answers, [id]: correct }; }
export function normalizeAnswer(value: string) { return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("de"); }
export function isSpellingCorrect(answer: string, word: Word) { return normalizeAnswer(answer) === normalizeAnswer(word.german); }
export function letterTiles(word: Word) {
  const chars = Array.from(word.german.normalize("NFC"));
  const tiles = shuffle(chars);
  // Avoid showing an already solved arrangement.
  if (tiles.join("") === chars.join("") && new Set(chars).size > 1) {
    const i = chars.findIndex(c => c !== chars[0]); [tiles[0], tiles[i]] = [tiles[i], tiles[0]];
  }
  return tiles;
}
