export type Word = {
  id: string; topic: string; german: string; vietnamese: string;
  article?: "der" | "die" | "das"; plural?: string; example: string; translation: string;
};
export function fullWord(word: Word) { return [word.article, word.german].filter(Boolean).join(" "); }
export function fullPlural(word: Word) { return word.article && word.plural && !word.plural.startsWith("—") ? `die ${word.plural}` : undefined; }
