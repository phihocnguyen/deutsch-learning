"use client";
import { useSyncExternalStore } from "react";
import { appendExerciseResult, parseProgress, STORAGE_KEY, type Progress, type WordStatus, type ExerciseResult } from "@/lib/progress";
import { ownerStorageKey } from "@/lib/owner-storage";
import { useLearningOwner } from "./learning-owner";

const initial = { progress: { version: 1, words: {} } as Progress, error: "", ready: false };
let snapshot = initial;
let initialized = false;
let activeKey = "";
const listeners = new Set<() => void>();
function emit() { for (const listener of listeners) listener(); }
function load(key: string) {
  try { snapshot = { progress: parseProgress(localStorage.getItem(key)), error: "", ready: true }; }
  catch { snapshot = { progress: snapshot.progress, ready: true, error: "Không đọc được tiến độ. Bạn vẫn có thể học trong phiên này. Dữ liệu cũ được giữ nguyên cho đến khi bạn chọn lưu kết quả mới." }; }
}
function getSnapshot(key: string) { if (typeof window !== "undefined" && (!initialized || activeKey !== key)) { initialized = true; activeKey = key; snapshot = initial; load(key); } return snapshot; }
function subscribe(key: string, listener: () => void) {
  listeners.add(listener);
  function sync(event: StorageEvent) { if (activeKey === key && (event.key === key || event.key === null)) { load(key); emit(); } }
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useProgress() {
  const key = ownerStorageKey(STORAGE_KEY, useLearningOwner());
  const state = useSyncExternalStore(listener => subscribe(key, listener), () => getSnapshot(key), () => initial);
  function update(change: (current: Progress) => Progress) {
    // Merge the latest disk state to preserve edits from another tab.
    let current = snapshot.progress;
    try { if (!snapshot.error) current = parseProgress(localStorage.getItem(key)); } catch { /* Keep usable session state. */ }
    const progress = change(current);
    let error = "";
    try { localStorage.setItem(key, JSON.stringify(progress)); }
    catch { error = "Không lưu được vào thiết bị. Thay đổi chỉ được giữ trong phiên hiện tại."; }
    snapshot = { progress, error, ready: true };
    emit();
  }
  function setStatus(id: string, status: WordStatus | undefined) {
    update(current => {
      const words = { ...current.words };
      if (status) words[id] = status; else delete words[id];
      return { ...current, words };
    });
  }
  function saveExerciseResult(result: ExerciseResult) {
    update(current => appendExerciseResult(current, result));
  }
  return { ...state, setStatus, saveExerciseResult };
}
