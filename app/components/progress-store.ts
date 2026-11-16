"use client";
import { useSyncExternalStore } from "react";
import { parseProgress, STORAGE_KEY, type Progress, type WordStatus } from "@/lib/progress";

const initial = { progress: { version: 1, words: {} } as Progress, error: "", ready: false };
let snapshot = initial;
let initialized = false;
const listeners = new Set<() => void>();
function emit() { for (const listener of listeners) listener(); }
function load() {
  try { snapshot = { progress: parseProgress(localStorage.getItem(STORAGE_KEY)), error: "", ready: true }; }
  catch { snapshot = { progress: snapshot.progress, ready: true, error: "Không đọc được tiến độ. Bạn vẫn có thể học trong phiên này. Dữ liệu cũ được giữ nguyên cho đến khi bạn chọn lưu kết quả mới." }; }
}
function getSnapshot() { if (!initialized && typeof window !== "undefined") { initialized = true; load(); } return snapshot; }
function subscribe(listener: () => void) {
  listeners.add(listener);
  function sync(event: StorageEvent) { if (event.key === STORAGE_KEY || event.key === null) { load(); emit(); } }
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initial);
  function setStatus(id: string, status: WordStatus | undefined) {
    // Merge the latest disk state to preserve edits from another tab.
    let current = snapshot.progress;
    try { if (!snapshot.error) current = parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { /* Keep usable session state. */ }
    const words = { ...current.words };
    if (status) words[id] = status; else delete words[id];
    const progress: Progress = { version: 1, words };
    let error = "";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { error = "Không lưu được vào thiết bị. Thay đổi chỉ được giữ trong phiên hiện tại."; }
    snapshot = { progress, error, ready: true };
    emit();
  }
  return { ...state, setStatus };
}
