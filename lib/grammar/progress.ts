import { findGrammarLesson } from "./index.ts";
export const GRAMMAR_STORAGE_KEY = "deutsch-quest-grammar-v1";
export type GrammarAttempt = { id: string; lessonId: string; kind: "practice" | "review"; completedAt: string; answers: Record<string, boolean> };
export type GrammarProgress = { version: 1; readLessons: string[]; attempts: GrammarAttempt[] };
export function emptyGrammarProgress(): GrammarProgress { return { version: 1, readLessons: [], attempts: [] }; }
export function parseGrammarProgress(raw: string | null): GrammarProgress {
  if (!raw) return emptyGrammarProgress();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.readLessons) || !Array.isArray(value.attempts)) throw new Error("Invalid grammar progress");
  const readLessons = [...new Set<string>(value.readLessons.filter((id: unknown) => typeof id === "string" && findGrammarLesson(id)))];
  const attempts: GrammarAttempt[] = [];
  const seen = new Set<string>();
  for (const attempt of value.attempts) {
    if (!attempt || typeof attempt.id !== "string" || !attempt.id || attempt.id.length > 100 || seen.has(attempt.id)) continue;
    const lesson = findGrammarLesson(attempt.lessonId);
    if (!lesson || !["practice", "review"].includes(attempt.kind) || typeof attempt.completedAt !== "string" || !Number.isFinite(Date.parse(attempt.completedAt))) continue;
    if (!attempt.answers || typeof attempt.answers !== "object" || Array.isArray(attempt.answers)) continue;
    const entries = Object.entries(attempt.answers);
    if (!entries.length || !entries.every(([id, correct]) => typeof correct === "boolean" && lesson.questions.some(q => q.id === id))) continue;
    if (attempt.kind === "practice" && entries.length !== lesson.questions.length) continue;
    attempts.push({ id: attempt.id, lessonId: lesson.id, kind: attempt.kind, completedAt: attempt.completedAt, answers: Object.fromEntries(entries) as Record<string, boolean> });
    seen.add(attempt.id);
    if (attempts.length === 50) break;
  }
  return { version: 1, readLessons, attempts };
}
export function appendGrammarAttempt(progress: GrammarProgress, attempt: GrammarAttempt): GrammarProgress {
  if (progress.attempts.some(a => a.id === attempt.id)) return progress;
  return { ...progress, attempts: [attempt, ...progress.attempts].slice(0, 50) };
}
export function latestGrammarAnswers(progress: GrammarProgress, lessonId: string): Record<string, boolean> {
  const answers: Record<string, boolean> = {};
  for (const attempt of progress.attempts) {
    if (attempt.lessonId !== lessonId) continue;
    for (const [id, correct] of Object.entries(attempt.answers)) if (!Object.hasOwn(answers, id)) answers[id] = correct;
  }
  return answers;
}
