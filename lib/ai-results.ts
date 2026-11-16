export function parseExample(value: unknown): { example: string; translation: string } {
  if (!value || typeof value !== "object") throw new Error("AI trả về câu ví dụ không hợp lệ.");
  const data = value as Record<string, unknown>;
  const example = data.example_de ?? data.sentence_de ?? data.example ?? data.german;
  const translation = data.example_vi ?? data.sentence_vi ?? data.translation ?? data.vietnamese;
  if (typeof example !== "string" || !example.trim() || example.length > 1000 || typeof translation !== "string" || !translation.trim() || translation.length > 1000)
    throw new Error("AI trả về câu ví dụ không hợp lệ.");
  return { example: example.trim(), translation: translation.trim() };
}
