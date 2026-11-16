import test from "node:test";
import assert from "node:assert/strict";
import { exercisePrompt, fallbackExerciseQuestions, parseQwenExercises } from "../lib/ai-exercises.ts";
import { checkExerciseAnswer } from "../lib/exercises.ts";

const word = { id: "door", topic: "Nhà", german: "Tür", article: "die", vietnamese: "cửa", example: "", translation: "" };
const item = { wordId: "door", example: "Die Tür ist offen.", translation: "Cửa đang mở.", explanation: "Tür là danh từ giống cái." };
const payload = { exercises: [item] };

test("Qwen accepts direct JSON, text, fenced JSON and common response envelopes", () => {
  for (const data of [payload, { exercises: [{ wordId: "door", example: item.example, translation: item.translation }] }, JSON.stringify(payload), { response: JSON.stringify(payload) }, { text: "```json\n" + JSON.stringify(payload) + "\n```" }, { choices: [{ message: { content: JSON.stringify(payload) } }] }]) {
    const [question] = parseQwenExercises(data, [word], "gap");
    assert.equal(question.prompt, "Die ____ ist offen.");
    assert.equal(question.answer, "Tür");
    assert.equal(question.word.id, word.id);
    assert.equal(question.word.translation, item.translation);
    assert.ok(checkExerciseAnswer(" TÜR ", question));
  }
});

test("AI explanations cannot override database answers or word ownership", () => {
  const altered = { exercises: [{ ...item, answer: "der", german: "Haus" }] };
  assert.equal(parseQwenExercises(altered, [word], "article")[0].answer, "die");
  assert.equal(parseQwenExercises(altered, [word], "translate")[0].answer, "die Tür");
  assert.throws(() => parseQwenExercises({ exercises: [{ ...item, wordId: "another-owner" }] }, [word], "gap"));
  const second = { ...word, id: "second" };
  assert.throws(() => parseQwenExercises({ exercises: [item, item] }, [word, second], "gap"));
});

test("Qwen rejects incomplete data, invalid sentences and words hidden in compounds", () => {
  for (const data of [null, "not JSON", {}, { exercises: [] }, { exercises: [{ ...item, translation: "" }] }, { exercises: [{ ...item, explanation: "x".repeat(1001) }] }, { exercises: [{ ...item, example: "Das ist eine Haustür." }] }]) {
    assert.throws(() => parseQwenExercises(data, [word], "gap"));
  }
  assert.throws(() => parseQwenExercises(payload, [{ ...word, article: undefined }], "article"));
});

test("AI prompt requests concise output and sends structured vocabulary context", () => {
  const request = exercisePrompt([word]);
  assert.match(request.prompt, /No explanation/);
  assert.equal(JSON.parse(request.context).words[0].wordId, word.id);
  assert.equal(JSON.parse(request.context).words[0].meaning_vi, word.vietnamese);
});

test("fallback creates usable gap questions from stored examples or a generic sentence", () => {
  const saved = { ...word, example: item.example, translation: item.translation };
  const questions = fallbackExerciseQuestions([saved, { ...word, id: "other", german: "gehen", vietnamese: "đi" }], "gap");
  assert.equal(questions.length, 2);
  assert.ok(questions.some(question => question.prompt === "Die ____ ist offen."));
  assert.ok(questions.some(question => question.prompt.includes("____") && question.answer === "gehen"));
  assert.equal(fallbackExerciseQuestions([word], "article")[0].answer, "die");
});
