import { vocabulary } from "./vocabulary.ts";
export type WordStatus = "known" | "review";
export type ExerciseResult = { id: string; mode: "gap" | "article" | "translate"; kind: "practice" | "review"; completedAt: string; total: number; correct: number; wrongIds: string[] };
export type Progress = { version: 1; words: Record<string, WordStatus>; exercises?: ExerciseResult[] };
export const STORAGE_KEY = "deutsch-quest-progress-v1";
export function appendExerciseResult(current: Progress, result: ExerciseResult): Progress {
  if (current.exercises?.some(item => item.id === result.id)) return current;
  const words = { ...current.words };
  for (const id of result.wrongIds) words[id] = "review";
  return { ...current, words, exercises: [result, ...(current.exercises ?? [])].slice(0, 50) };
}
export function parseProgress(raw: string | null): Progress {
  if (!raw) return { version: 1, words: {} };
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || typeof value.words !== "object" || !value.words || Array.isArray(value.words)) throw new Error("Dữ liệu tiến độ không hợp lệ hoặc khác phiên bản.");
  const words: Record<string, WordStatus> = {};
  for (const word of vocabulary) {
    const status = value.words[word.id];
    if (status === "known" || status === "review") words[word.id] = status;
  }
  const exercises: ExerciseResult[] = [];
  if (Array.isArray(value.exercises)) {
    const ids = new Set<string>();
    for (const result of value.exercises) {
      if (!result || typeof result.id !== "string" || !result.id || result.id.length > 100 || ids.has(result.id)) continue;
      if (!["gap", "article", "translate"].includes(result.mode) || !["practice", "review"].includes(result.kind)) continue;
      if (typeof result.completedAt !== "string" || !Number.isFinite(Date.parse(result.completedAt))) continue;
      if (!Number.isInteger(result.total) || result.total < 1 || result.total > vocabulary.length || !Number.isInteger(result.correct) || result.correct < 0 || result.correct > result.total) continue;
      if (!Array.isArray(result.wrongIds) || result.wrongIds.length !== result.total - result.correct || new Set(result.wrongIds).size !== result.wrongIds.length || !result.wrongIds.every((id: unknown) => typeof id === "string" && vocabulary.some(w => w.id === id))) continue;
      exercises.push({ id: result.id, mode: result.mode, kind: result.kind, completedAt: result.completedAt, total: result.total, correct: result.correct, wrongIds: [...result.wrongIds] });
      ids.add(result.id);
      if (exercises.length === 50) break;
    }
  }
  return { version: 1, words, ...(value.exercises !== undefined ? { exercises } : {}) };
}
