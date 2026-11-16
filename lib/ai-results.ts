export function parseScore(value: unknown): number {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : null;
  const score = data?.score ?? data?.ipa_similarity;
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) throw new Error("AI trả về điểm không hợp lệ.");
  return Math.round(score * 10) / 10;
}

export function parseExample(value: unknown): { example: string; translation: string } {
  for (let depth = 0; depth < 6; depth++) {
    if (typeof value === "string") {
      const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      try { value = JSON.parse(text); continue; }
      catch {
        const json = text.match(/\{[\s\S]*\}/)?.[0];
        if (json) { try { value = JSON.parse(json); continue; } catch { /* Try labeled text below. */ } }
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const german = lines.find(line => /^(?:deutsch|german|beispiel|example|câu tiếng đức)\s*:/i.test(line));
        const vietnamese = lines.find(line => /^(?:vietnamesisch|vietnamese|translation|übersetzung|dịch|tiếng việt)\s*:/i.test(line));
        if (german && vietnamese) value = { example: german.replace(/^[^:]+:\s*/, ""), translation: vietnamese.replace(/^[^:]+:\s*/, "") };
        else break;
      }
    }
    if (Array.isArray(value)) { value = value.find(item => item != null); continue; }
    if (!value || typeof value !== "object") break;
    const data = value as Record<string, unknown>;
    if (["example_de", "sentence_de", "example", "german"].some(key => typeof data[key] === "string") && ["example_vi", "sentence_vi", "translation_vi", "translation", "vietnamese"].some(key => typeof data[key] === "string")) break;
    const choices = data.choices as { message?: { content?: unknown }; text?: unknown }[] | undefined;
    value = data.data ?? data.result ?? data.response ?? data.output ?? data.content ?? data.text ?? data.answer ?? data.message ?? (Array.isArray(choices) ? choices[0]?.message?.content ?? choices[0]?.text : undefined);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("AI trả về câu ví dụ không hợp lệ.");
  const data = value as Record<string, unknown>;
  const example = data.example_de ?? data.sentence_de ?? data.example ?? data.german;
  const translation = data.example_vi ?? data.sentence_vi ?? data.translation_vi ?? data.translation ?? data.vietnamese;
  if (typeof example !== "string" || !example.trim() || example.length > 1000 || typeof translation !== "string" || !translation.trim() || translation.length > 1000)
    throw new Error("AI trả về câu ví dụ không hợp lệ.");
  return { example: example.trim(), translation: translation.trim() };
}
