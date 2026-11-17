export type GrammarLevel = "A1" | "A2" | "B1" | "B2";
export type GrammarSource = { publisher: string; title: string; url: string; section: string; accessedAt: string; supports: string };
export type GrammarQuestion = { id: string; prompt: string; answers: string[]; explanation: string; options?: string[]; caseSensitive?: boolean };
export type GrammarLesson = {
  id: string; level: GrammarLevel; title: string; summary: string; objectives: string[];
  prerequisites: string[]; rules: string[]; table: { headers: string[]; rows: string[][] };
  examples: { de: string; vi: string }[]; mistake: { wrong: string; right: string; why: string };
  scope: string; sources: GrammarSource[]; questions: GrammarQuestion[];
};
export const grammarLevels: GrammarLevel[] = ["A1", "A2", "B1", "B2"];
export function grammarPath(level: GrammarLevel) { return `/grammar/${level.toLowerCase()}`; }
export function question(id: string, prompt: string, answer: string | string[], explanation: string, options?: string[]): GrammarQuestion {
  return { id, prompt, answers: typeof answer === "string" ? [answer] : answer, explanation, ...(options ? { options } : {}) };
}
