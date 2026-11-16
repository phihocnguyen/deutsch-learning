import { fullWord, type Word } from "./vocabulary.ts";
import { normalizeAnswer, shuffle } from "./games.ts";
export type ExerciseMode = "gap" | "article" | "translate";
export type ExerciseQuestion = { word: Word; prompt: string; answer: string; explanation: string };
function gapMatch(word: Word) {
  const escaped = word.german.normalize("NFC").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Do not guess conjugations or remove substrings from unrelated German words.
  return word.example.normalize("NFC").match(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu"));
}
export function createExerciseQuestions(mode: ExerciseMode, topic = "", ids?: string[], limit = 5, vocabulary: Word[] = []): ExerciseQuestion[] {
  const pool = vocabulary.filter(w => (!topic || w.topic === topic) && (!ids || ids.includes(w.id)) && (mode !== "article" || w.article) && (mode !== "gap" || gapMatch(w)));
  return shuffle(pool).slice(0, limit).map(word => {
    if (mode === "article") return { word, prompt: word.german, answer: word.article!, explanation: `${fullWord(word)}: ${word.article === "der" ? "giống đực" : word.article === "die" ? "giống cái" : "giống trung"}. Hãy học mạo từ cùng với danh từ; không phải từ nào cũng có quy tắc đoán giống.` };
    if (mode === "translate") return { word, prompt: word.vietnamese, answer: fullWord(word), explanation: word.article ? `Từ đã học là ${fullWord(word)}. Danh từ phải có mạo từ ${word.article}; khi viết chuẩn, danh từ bắt đầu bằng chữ hoa.` : `Từ/cụm từ trong bộ từ vựng là ${word.german}. ${word.translation}` };
    const match = gapMatch(word)!;
    const example = word.example.normalize("NFC");
    return { word, prompt: `${example.slice(0, match.index)}____${example.slice(match.index! + match[0].length)}`, answer: match[0], explanation: `${match[0]} nghĩa là “${word.vietnamese.toLocaleLowerCase("vi")}”. ${word.translation}` };
  });
}
export function checkExerciseAnswer(value: string, question: ExerciseQuestion) { return normalizeAnswer(value) === normalizeAnswer(question.answer); }
export const exerciseNames: Record<ExerciseMode, string> = { gap: "Điền từ vào câu", article: "Chọn mạo từ", translate: "Dịch Việt – Đức" };
