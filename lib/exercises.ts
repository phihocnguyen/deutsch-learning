import { fullWord, vocabulary, type Word } from "./vocabulary.ts";
import { normalizeAnswer, shuffle } from "./games.ts";
export type ExerciseMode = "gap" | "article" | "translate";
export type ExerciseQuestion = { word: Word; prompt: string; answer: string; explanation: string };
const gaps: Record<string, { answer: string; explanation?: string }> = {
  hallo: { answer: "Hallo" }, danke: { answer: "Danke" }, bitte: { answer: "bitte" }, tschuss: { answer: "Tschüss" }, morgen: { answer: "Guten Morgen" },
  mutter: { answer: "Mutter" }, vater: { answer: "Vater" }, kind: { answer: "Kind" }, bruder: { answer: "Bruder" }, schwester: { answer: "Schwester" },
  apfel: { answer: "Apfel", explanation: "Apfel là danh từ giống đực. Sau essen, einen Apfel ở cách Akkusativ." },
  brot: { answer: "Brot" }, wasser: { answer: "Wasser" }, milch: { answer: "Milch" }, ei: { answer: "Ei" },
  haus: { answer: "Haus" }, tisch: { answer: "Tisch", explanation: "Tisch là danh từ giống đực. Auf dem Tisch diễn tả vị trí, dùng Dativ." },
  stuhl: { answer: "Stuhl" }, tur: { answer: "Tür" }, fenster: { answer: "Fenster" },
  lernen: { answer: "lernen", explanation: "Với chủ ngữ wir, lernen giữ đuôi -en: wir lernen." },
  lesen: { answer: "lese", explanation: "Lesen chia với ich thành lese: ich lese." },
  essen: { answer: "essen", explanation: "Với chủ ngữ wir, essen giữ đuôi -en: wir essen." },
  trinken: { answer: "trinke", explanation: "Trinken chia với ich thành trinke: ich trinke." },
  schlafen: { answer: "schläft", explanation: "Schlafen chia ở ngôi thứ ba số ít thành schläft, đổi a thành ä." },
};
export function createExerciseQuestions(mode: ExerciseMode, topic = "", ids?: string[], limit = 5): ExerciseQuestion[] {
  const pool = vocabulary.filter(w => (!topic || w.topic === topic) && (!ids || ids.includes(w.id)) && (mode !== "article" || w.article));
  return shuffle(pool).slice(0, limit).map(word => {
    if (mode === "article") return { word, prompt: word.german, answer: word.article!, explanation: `${fullWord(word)}: ${word.article === "der" ? "giống đực" : word.article === "die" ? "giống cái" : "giống trung"}. Hãy học mạo từ cùng với danh từ; không phải từ nào cũng có quy tắc đoán giống.` };
    if (mode === "translate") return { word, prompt: word.vietnamese, answer: fullWord(word), explanation: word.article ? `Từ đã học là ${fullWord(word)}. Danh từ phải có mạo từ ${word.article}; khi viết chuẩn, danh từ bắt đầu bằng chữ hoa.` : `Từ/cụm từ trong bộ từ vựng là ${word.german}. ${word.translation}` };
    const gap = gaps[word.id];
    return { word, prompt: word.example.replace(gap.answer, "____"), answer: gap.answer, explanation: gap.explanation ?? `${gap.answer} nghĩa là “${word.vietnamese.toLocaleLowerCase("vi")}”. ${word.translation}` };
  });
}
export function checkExerciseAnswer(value: string, question: ExerciseQuestion) { return normalizeAnswer(value) === normalizeAnswer(question.answer); }
export const exerciseNames: Record<ExerciseMode, string> = { gap: "Điền từ vào câu", article: "Chọn mạo từ", translate: "Dịch Việt – Đức" };
