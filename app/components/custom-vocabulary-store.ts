"use client";
import { useSyncExternalStore } from "react";
import { CUSTOM_STORAGE_KEY, emptyCustomVocabulary, parseCustomVocabulary, type CustomVocabulary } from "@/lib/custom-vocabulary";

const initial = { data: emptyCustomVocabulary, ready: false, error: "" };
let snapshot = initial;
let initialized = false;
const listeners = new Set<() => void>();
async function loadDatabase() {
  try {
    const response = await fetch("/api/topics", { cache: "no-store" });
    if (!response.ok) throw new Error(response.status === 401 ? "Hãy đăng nhập lại để tải chủ đề." : "Không tải được chủ đề từ cơ sở dữ liệu.");
    const { topics } = await response.json() as { topics: { id: string; name: string }[] };
    const words = (await Promise.all(topics.map(async topic => {
      const result = await fetch(`/api/topics/${topic.id}/flashcards`, { cache: "no-store" });
      if (!result.ok) throw new Error("Không tải được flashcard từ cơ sở dữ liệu.");
      const data = await result.json() as { flashcards: import("@/lib/custom-vocabulary").CustomWord[] };
      return data.flashcards.map(card => ({ ...card, article: card.article ?? undefined, plural: card.plural ?? undefined }));
    }))).flat();
    const data = parseCustomVocabulary(JSON.stringify({ version: 1, topics, words }));
    snapshot = { data, ready: true, error: "" };
    emit();
  } catch (error) {
    snapshot = { data: emptyCustomVocabulary, ready: true, error: error instanceof Error ? error.message : "Không tải được dữ liệu từ cơ sở dữ liệu." };
    emit();
  }
}
function getSnapshot() {
  if (!initialized && typeof window !== "undefined") { initialized = true; void loadDatabase(); }
  return snapshot;
}
function emit() { listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === CUSTOM_STORAGE_KEY || event.key === null) { void loadDatabase(); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useCustomVocabulary() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initial);
  function update(change: (data: CustomVocabulary) => CustomVocabulary) {
    const current = snapshot.data;
    const data = parseCustomVocabulary(JSON.stringify(change(current)));
    let error = snapshot.error;
    if (!error) {
      try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(data)); }
      catch { error = "Không lưu được bộ thẻ trên thiết bị. Thay đổi chỉ được giữ trong phiên hiện tại."; }
    }
    snapshot = { data, ready: true, error };
    emit();
    return !error;
  }
  return { ...state, update };
}
