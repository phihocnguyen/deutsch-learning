import { a1Lessons } from "./a1.ts";
import { a2Lessons } from "./a2.ts";
import type { GrammarQuestion } from "./types.ts";
export const grammarLessons = [...a1Lessons, ...a2Lessons];
export function findGrammarLesson(id: string) { return grammarLessons.find(lesson => lesson.id === id); }
export function normalizeGrammarAnswer(text: string, caseSensitive = true) {
  const normalized = text.normalize("NFC").trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
  return caseSensitive ? normalized : normalized.toLocaleLowerCase("de");
}
export function gradeGrammarAnswer(question: GrammarQuestion, answer: string) {
  return question.answers.some(expected => normalizeGrammarAnswer(expected, question.caseSensitive !== false) === normalizeGrammarAnswer(answer, question.caseSensitive !== false));
}
