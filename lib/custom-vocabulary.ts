import { type Word } from "./vocabulary.ts";

export const CUSTOM_STORAGE_KEY = "deutsch-quest-custom-v1";
export type CustomTopic = { id: string; name: string };
export type CustomWord = Word & { topicId: string };
export type CustomVocabulary = { version: 1; topics: CustomTopic[]; words: CustomWord[] };
export const emptyCustomVocabulary: CustomVocabulary = { version: 1, topics: [], words: [] };
export const customWordId = /^(?:custom-[0-9a-f-]{36}|[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const text = (value: unknown, limit: number, required = false): value is string =>
  typeof value === "string" && value.length <= limit && (!required || !!value.trim());

export function validateTopicName(name: string, current: CustomVocabulary, exceptId?: string) {
  const normalized = name.trim().toLocaleLowerCase("vi");
  if (!normalized || name.trim().length > 80) throw new Error("Tên chủ đề cần từ 1 đến 80 ký tự.");
  if (current.topics.filter(t => t.id !== exceptId).some(t => t.name.toLocaleLowerCase("vi") === normalized))
    throw new Error("Chủ đề này đã có. Hãy chọn tên khác.");
}

export function parseCustomVocabulary(raw: string | null): CustomVocabulary {
  if (!raw) return { version: 1, topics: [], words: [] };
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.topics) || !Array.isArray(value.words)) throw new Error("Dữ liệu bộ thẻ không hợp lệ.");
  const result: CustomVocabulary = { version: 1, topics: [], words: [] };
  for (const topic of value.topics) {
    if (!topic || !text(topic.id, 100, true) || !text(topic.name, 80, true) || result.topics.some(t => t.id === topic.id)) throw new Error("Chủ đề không hợp lệ.");
    validateTopicName(topic.name, result);
    result.topics.push({ id: topic.id, name: topic.name.trim() });
  }
  for (const word of value.words) {
    const topic = result.topics.find(t => t.id === word?.topicId);
    if (!topic || typeof word.id !== "string" || !customWordId.test(word.id) || result.words.some(w => w.id === word.id)
      || !text(word.german, 160, true) || !text(word.vietnamese, 300, true)
      || !text(word.example, 1000) || !text(word.translation, 1000)
      || (word.article !== undefined && !["der", "die", "das"].includes(word.article))
      || (word.plural !== undefined && !text(word.plural, 160))) throw new Error("Flashcard không hợp lệ.");
    result.words.push({ id: word.id, topicId: topic.id, topic: topic.name, german: word.german.trim(), vietnamese: word.vietnamese.trim(), example: word.example.trim(), translation: word.translation.trim(), ...(word.article ? { article: word.article } : {}), ...(word.plural ? { plural: word.plural.trim() } : {}) });
  }
  return result;
}
