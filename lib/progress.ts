import { vocabulary } from "./vocabulary.ts";
export type WordStatus = "known" | "review";
export type Progress = { version: 1; words: Record<string, WordStatus> };
export const STORAGE_KEY = "deutsch-quest-progress-v1";
export function parseProgress(raw: string | null): Progress {
  if (!raw) return { version: 1, words: {} };
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || typeof value.words !== "object" || !value.words || Array.isArray(value.words)) throw new Error("Dữ liệu tiến độ không hợp lệ hoặc khác phiên bản.");
  const words: Record<string, WordStatus> = {};
  for (const word of vocabulary) {
    const status = value.words[word.id];
    if (status === "known" || status === "review") words[word.id] = status;
  }
  return { version: 1, words };
}
