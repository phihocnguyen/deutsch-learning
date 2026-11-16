import type { Page } from "@playwright/test";
import { topics, vocabulary as sampleWords } from "../../tests/fixtures/vocabulary";

// Explicit browser-test data; never shipped as a default deck in the application.
const conjugated: Record<string, string> = { lesen: "lese", trinken: "trinke", schlafen: "schläft" };
export const vocabulary = sampleWords.map((word, index) => ({ ...word,
  id: `custom-00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  topicId: `fixture-topic-${topics.indexOf(word.topic as typeof topics[number])}`,
  german: conjugated[word.id] ?? word.german,
}));
export async function seedVocabulary(page: Page) {
  await page.addInitScript(data => {
    if (!localStorage.getItem("deutsch-quest-custom-v1")) localStorage.setItem("deutsch-quest-custom-v1", JSON.stringify(data));
  }, { version: 1, topics: topics.map((name, index) => ({ id: `fixture-topic-${index}`, name })), words: vocabulary });
}
