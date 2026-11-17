"use client";
import { useSyncExternalStore } from "react";
import { emptyCustomVocabulary, parseCustomVocabulary, type CustomVocabulary } from "@/lib/custom-vocabulary";
import { useLearningOwner } from "./learning-owner";

const initial = { data: emptyCustomVocabulary, ready: false, error: "" };
let snapshot = initial;
let initialized = false;
let activeOwner = "";
const listeners = new Set<() => void>();
async function loadDatabase(ownerId: string) {
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
    if (activeOwner !== ownerId) return;
    snapshot = { data, ready: true, error: "" };
    emit();
  } catch (error) {
    if (activeOwner !== ownerId) return;
    snapshot = { data: emptyCustomVocabulary, ready: true, error: error instanceof Error ? error.message : "Không tải được dữ liệu từ cơ sở dữ liệu." };
    emit();
  }
}
function getSnapshot(ownerId: string) {
  if (typeof window !== "undefined" && (!initialized || activeOwner !== ownerId)) {
    initialized = true; activeOwner = ownerId; snapshot = initial; void loadDatabase(ownerId);
  }
  return snapshot;
}
function emit() { listeners.forEach(listener => listener()); }
function subscribe(ownerId: string, listener: () => void) {
  listeners.add(listener);
  const sync = () => { if (activeOwner === ownerId) void loadDatabase(ownerId); };
  window.addEventListener("focus", sync);
  return () => { listeners.delete(listener); window.removeEventListener("focus", sync); };
}
export function useCustomVocabulary() {
  const ownerId = useLearningOwner();
  const state = useSyncExternalStore(listener => subscribe(ownerId, listener), () => getSnapshot(ownerId), () => initial);
  function update(change: (data: CustomVocabulary) => CustomVocabulary) {
    const current = snapshot.data;
    const data = parseCustomVocabulary(JSON.stringify(change(current)));
    const error = snapshot.error;
    snapshot = { data, ready: true, error };
    emit();
    return !error;
  }
  return { ...state, update };
}
