"use client";
import { useSyncExternalStore } from "react";
import { appendGrammarAttempt, emptyGrammarProgress, GRAMMAR_STORAGE_KEY, parseGrammarProgress, type GrammarAttempt, type GrammarProgress } from "@/lib/grammar/progress";
import { ownerStorageKey } from "@/lib/owner-storage";
import { useLearningOwner } from "./learning-owner";
const initial = { progress: emptyGrammarProgress(), ready: false, error: "" };
let snapshot = initial;
let initialized = false;
let activeKey = "";
const listeners = new Set<() => void>();
function emit() { for (const listener of listeners) listener(); }
function load(key: string) {
  try { snapshot = { progress: parseGrammarProgress(localStorage.getItem(key)), ready: true, error: "" }; }
  catch { snapshot = { progress: snapshot.progress, ready: true, error: "Không đọc được tiến độ ngữ pháp. Dữ liệu cũ được giữ nguyên cho tới khi bạn chọn lưu thay đổi mới." }; }
}
function getSnapshot(key: string) { if (typeof window !== "undefined" && (!initialized || activeKey !== key)) { initialized = true; activeKey = key; snapshot = initial; load(key); } return snapshot; }
function subscribe(key: string, listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (activeKey === key && (event.key === key || event.key === null)) { load(key); emit(); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useGrammarProgress() {
  const key = ownerStorageKey(GRAMMAR_STORAGE_KEY, useLearningOwner());
  const state = useSyncExternalStore(listener => subscribe(key, listener), () => getSnapshot(key), () => initial);
  function update(change: (current: GrammarProgress) => GrammarProgress) {
    let current = snapshot.progress;
    try { if (!snapshot.error) current = parseGrammarProgress(localStorage.getItem(key)); } catch { /* Preserve session state. */ }
    const progress = change(current);
    let error = "";
    try { localStorage.setItem(key, JSON.stringify(progress)); }
    catch { error = "Không lưu được tiến độ ngữ pháp trên thiết bị. Thay đổi được giữ trong phiên hiện tại."; }
    snapshot = { progress, ready: true, error }; emit();
  }
  function markRead(id: string, read: boolean) { update(current => ({ ...current, readLessons: read ? [...new Set([...current.readLessons, id])] : current.readLessons.filter(item => item !== id) })); }
  function saveAttempt(attempt: GrammarAttempt) { update(current => appendGrammarAttempt(current, attempt)); }
  return { ...state, markRead, saveAttempt };
}
