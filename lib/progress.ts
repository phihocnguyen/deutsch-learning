import { customWordId } from "./custom-vocabulary.ts";
// Accept old IDs only to preserve previously saved progress/history after removing sample decks.
const legacyIds = new Set("hallo danke bitte tschuss morgen mutter vater kind bruder schwester apfel brot wasser milch ei haus tisch stuhl tur fenster lernen lesen essen trinken schlafen".split(" "));
const validId = (id: unknown): id is string => typeof id === "string" && (legacyIds.has(id) || customWordId.test(id));
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
  for (const [id, status] of Object.entries(value.words)) {
    if (validId(id) && (status === "known" || status === "review")) words[id] = status;
  }
  const exercises: ExerciseResult[] = [];
  if (Array.isArray(value.exercises)) {
    const ids = new Set<string>();
    for (const result of value.exercises) {
      if (!result || typeof result.id !== "string" || !result.id || result.id.length > 100 || ids.has(result.id)) continue;
      if (!["gap", "article", "translate"].includes(result.mode) || !["practice", "review"].includes(result.kind)) continue;
      if (typeof result.completedAt !== "string" || !Number.isFinite(Date.parse(result.completedAt))) continue;
      if (!Number.isInteger(result.total) || result.total < 1 || result.total > 25 || !Number.isInteger(result.correct) || result.correct < 0 || result.correct > result.total) continue;
      if (!Array.isArray(result.wrongIds) || result.wrongIds.length !== result.total - result.correct || new Set(result.wrongIds).size !== result.wrongIds.length || !result.wrongIds.every(validId)) continue;
      exercises.push({ id: result.id, mode: result.mode, kind: result.kind, completedAt: result.completedAt, total: result.total, correct: result.correct, wrongIds: [...result.wrongIds] });
      ids.add(result.id);
      if (exercises.length === 50) break;
    }
  }
  return { version: 1, words, ...(value.exercises !== undefined ? { exercises } : {}) };
}
