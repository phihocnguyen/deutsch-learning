import test from "node:test";
import assert from "node:assert/strict";
import { grammarLessons, findGrammarLesson, gradeGrammarAnswer } from "../lib/grammar/index.ts";
import { emptyGrammarProgress, appendGrammarAttempt, parseGrammarProgress, latestGrammarAnswers } from "../lib/grammar/progress.ts";

test("two levels contain 28 unique lessons, with prerequisites already introduced", () => {
  const seen = new Set();
  for (const level of ["A1", "A2"]) assert.equal(grammarLessons.filter(l => l.level === level).length, 14);
  for (const lesson of grammarLessons) {
    assert.ok(!seen.has(lesson.id));
    for (const required of lesson.prerequisites) assert.ok(seen.has(required), `${lesson.id}: ${required}`);
    seen.add(lesson.id);
  }
});
test("lessons have scoped rules, valid tables, original examples and traceable source locations", () => {
  for (const lesson of grammarLessons) {
    assert.ok(lesson.rules.length >= 2 && lesson.scope && lesson.objectives.length);
    assert.ok(lesson.examples.length >= 2);
    assert.ok(lesson.examples.every(e => e.de && e.vi));
    assert.ok(lesson.mistake.wrong && lesson.mistake.right && lesson.mistake.why);
    for (const row of lesson.table.rows) assert.equal(row.length, lesson.table.headers.length);
    assert.ok(lesson.sources.length);
    for (const source of lesson.sources) { assert.equal(new URL(source.url).protocol, "https:"); assert.ok(source.section && source.supports && source.accessedAt); }
    if (lesson.level === "A2") assert.ok(lesson.sources.some(s => s.publisher !== "Deutsche Welle"), "A level index alone does not support a rule");
  }
});
test("89 exercise questions have unique local IDs and grade all declared alternatives", () => {
  let count = 0;
  for (const lesson of grammarLessons) {
    assert.equal(new Set(lesson.questions.map(q => q.id)).size, lesson.questions.length);
    for (const question of lesson.questions) {
      count++;
      assert.ok(question.explanation && question.prompt && question.answers.length);
      for (const answer of question.answers) { assert.ok(gradeGrammarAnswer(question, answer)); if (question.options) assert.ok(question.options.includes(answer)); }
      if (question.options) assert.equal(new Set(question.options).size, question.options.length);
      assert.equal(gradeGrammarAnswer(question, ""), false);
    }
  }
  assert.equal(count, 89);
});
test("grammar grading preserves capitalization, umlauts, sharp s and required punctuation", () => {
  const plural = findGrammarLesson("a1-articles").questions[1];
  assert.ok(gradeGrammarAnswer(plural, "  die Bu\u0308cher  "));
  assert.equal(gradeGrammarAnswer(plural, "die Bücher".toLowerCase()), false);
  assert.equal(gradeGrammarAnswer(plural, "die Bucher"), false);
  assert.equal(gradeGrammarAnswer(findGrammarLesson("a1-pronouns").questions[2], "sie"), false);
  const sentence = findGrammarLesson("a1-word-order").questions[2];
  assert.ok(gradeGrammarAnswer(sentence, "Lernst   du heute?"));
  assert.equal(gradeGrammarAnswer(sentence, "Lernst du heute"), false);
  assert.equal(gradeGrammarAnswer({ answers: ["weiß"] }, "weiss"), false);
});
test("declared alternate imperative forms are both accepted", () => {
  const question = findGrammarLesson("a1-imperative").questions[0];
  assert.ok(gradeGrammarAnswer(question, "Komm")); assert.ok(gradeGrammarAnswer(question, "Komme"));
});

const attempt = { id: "attempt-1", lessonId: "a1-pronouns", kind: "practice", completedAt: "2026-11-16T10:00:00Z", answers: { "1": true, "2": false, "3": true } };
test("grammar progress round-trips separately and rejects corrupt or foreign schemas", () => {
  assert.deepEqual(parseGrammarProgress(null), emptyGrammarProgress());
  for (const value of ["{", "null", '{"version":2,"readLessons":[],"attempts":[]}', '{"version":1,"words":{}}']) assert.throws(() => parseGrammarProgress(value));
  const progress = appendGrammarAttempt({ ...emptyGrammarProgress(), readLessons: ["a1-pronouns"] }, attempt);
  assert.deepEqual(parseGrammarProgress(JSON.stringify(progress)), progress);
  assert.equal(appendGrammarAttempt(progress, attempt), progress);
});
test("malformed attempts and unknown lessons/questions cannot inflate grammar results", () => {
  const progress = parseGrammarProgress(JSON.stringify({ version: 1, readLessons: ["unknown", "a1-pronouns", "a1-pronouns"], attempts: [attempt, attempt, { ...attempt, id: "unknown", lessonId: "missing" }, { ...attempt, id: "question", answers: { "7": true } }, { ...attempt, id: "bool", answers: { "1": "true", "2": true, "3": true } }, { ...attempt, id: "incomplete", answers: { "1": true } }, { ...attempt, id: "date", completedAt: "invalid" }] }));
  assert.deepEqual(progress.readLessons, ["a1-pronouns"]);
  assert.deepEqual(progress.attempts, [attempt]);
});
test("review updates only the reviewed question and preserves first-attempt history", () => {
  const first = appendGrammarAttempt(emptyGrammarProgress(), attempt);
  const second = appendGrammarAttempt(first, { ...attempt, id: "review-1", kind: "review", answers: { "2": true } });
  assert.deepEqual(latestGrammarAnswers(second, "a1-pronouns"), { "2": true, "1": true, "3": true });
  assert.equal(second.attempts[1].answers["2"], false);
  let bounded = second;
  for (let i = 0; i < 60; i++) bounded = appendGrammarAttempt(bounded, { ...attempt, id: `attempt-${i}` });
  assert.equal(bounded.attempts.length, 50);
});
