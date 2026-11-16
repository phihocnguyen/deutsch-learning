"use client";
import { useSyncExternalStore } from "react";
import { appendGrammarAttempt, emptyGrammarProgress, GRAMMAR_STORAGE_KEY, parseGrammarProgress, type GrammarAttempt, type GrammarProgress } from "@/lib/grammar/progress";
const initial = { progress: emptyGrammarProgress(), ready: false, error: "" };
let snapshot = initial;
let initialized = false;
const listeners = new Set<() => void>();
function emit() { for (const listener of listeners) listener(); }
function load() {
  try { snapshot = { progress: parseGrammarProgress(localStorage.getItem(GRAMMAR_STORAGE_KEY)), ready: true, error: "" }; }
  catch { snapshot = { progress: snapshot.progress, ready: true, error: "Không đọc được tiến độ ngữ pháp. Dữ liệu cũ được giữ nguyên cho tới khi bạn chọn lưu thay đổi mới." }; }
}
function getSnapshot() { if (!initialized && typeof window !== "undefined") { initialized = true; load(); } return snapshot; }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === GRAMMAR_STORAGE_KEY || event.key === null) { load(); emit(); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useGrammarProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initial);
  function update(change: (current: GrammarProgress) => GrammarProgress) {
    let current = snapshot.progress;
    try { if (!snapshot.error) current = parseGrammarProgress(localStorage.getItem(GRAMMAR_STORAGE_KEY)); } catch { /* Preserve session state. */ }
    const progress = change(current);
    let error = "";
    try { localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(progress)); }
    catch { error = "Không lưu được tiến độ ngữ pháp trên thiết bị. Thay đổi được giữ trong phiên hiện tại."; }
    snapshot = { progress, ready: true, error }; emit();
  }
  function markRead(id: string, read: boolean) { update(current => ({ ...current, readLessons: read ? [...new Set([...current.readLessons, id])] : current.readLessons.filter(item => item !== id) })); }
  function saveAttempt(attempt: GrammarAttempt) { update(current => appendGrammarAttempt(current, attempt)); }
  return { ...state, markRead, saveAttempt };
}
