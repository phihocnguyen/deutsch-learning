import test from "node:test";
import assert from "node:assert/strict";
import { createExerciseQuestions, checkExerciseAnswer } from "../lib/exercises.ts";
import { appendExerciseResult, parseProgress } from "../lib/progress.ts";

const result = { id: "attempt-1", mode: "gap", kind: "practice", completedAt: "2026-11-16T10:00:00.000Z", total: 5, correct: 4, wrongIds: ["haus"] };
test("gap questions reconstruct the original sentence and handle conjugated verbs", () => {
  const questions = createExerciseQuestions("gap", "", undefined, 25);
  assert.equal(questions.length, 25);
  for (const question of questions) { assert.ok(question.prompt.includes("____")); assert.equal(question.prompt.replace("____", question.answer), question.word.example); }
  assert.equal(questions.find(q => q.word.id === "schlafen").answer, "schläft");
  assert.equal(questions.find(q => q.word.id === "lesen").answer, "lese");
});
test("article questions exclude verbs/greetings and respect an empty review pool", () => {
  assert.deepEqual(createExerciseQuestions("article", "Chào hỏi"), []);
  assert.deepEqual(createExerciseQuestions("gap", "", []), []);
  const questions = createExerciseQuestions("article", "Nhà cửa", ["haus", "tur"]);
  assert.equal(questions.length, 2); assert.ok(questions.every(q => q.answer === q.word.article));
});
test("translation requires articles but tolerates whitespace/case and normalized umlaut", () => {
  const haus = createExerciseQuestions("translate", "", ["haus"])[0];
  assert.ok(checkExerciseAnswer("  DAS   HAUS ", haus)); assert.equal(checkExerciseAnswer("Haus", haus), false);
  const tur = createExerciseQuestions("translate", "", ["tur"])[0];
  assert.ok(checkExerciseAnswer("die Tu\u0308r", tur)); assert.equal(checkExerciseAnswer("die Tur", tur), false);
});
test("old progress survives history addition; failed words enter review; result cannot save twice", () => {
  const old = parseProgress('{"version":1,"words":{"apfel":"known","haus":"known"}}');
  const updated = appendExerciseResult(old, result);
  assert.equal(updated.words.apfel, "known"); assert.equal(updated.words.haus, "review");
  assert.equal(updated.exercises.length, 1); assert.equal(appendExerciseResult(updated, result), updated);
  assert.deepEqual(parseProgress(JSON.stringify(updated)), updated);
});
test("history is bounded and malformed, duplicate or impossible scores are ignored", () => {
  let progress = { version: 1, words: {} };
  for (let i = 0; i < 60; i++) progress = appendExerciseResult(progress, { ...result, id: `attempt-${i}` });
  assert.equal(progress.exercises.length, 50); assert.equal(progress.exercises[0].id, "attempt-59");
  const parsed = parseProgress(JSON.stringify({ version: 1, words: { apfel: "known" }, exercises: [result, result, { ...result, id: "invalid", correct: 6 }, { ...result, id: "date", completedAt: "invalid" }, { ...result, id: "ids", wrongIds: ["missing"] }, { ...result, id: "total", total: 0 }] }));
  assert.deepEqual(parsed.exercises, [result]); assert.deepEqual(parsed.words, { apfel: "known" });
});
