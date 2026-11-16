"use client";
import { useSyncExternalStore } from "react";
import { CUSTOM_STORAGE_KEY, emptyCustomVocabulary, parseCustomVocabulary, type CustomVocabulary } from "@/lib/custom-vocabulary";

const initial = { data: emptyCustomVocabulary, ready: false, error: "" };
let snapshot = initial;
let initialized = false;
const listeners = new Set<() => void>();
function load() {
  try { snapshot = { data: parseCustomVocabulary(localStorage.getItem(CUSTOM_STORAGE_KEY)), ready: true, error: "" }; }
  catch { snapshot = { ...snapshot, ready: true, error: "Không đọc được bộ thẻ đã lưu. Dữ liệu cũ vẫn được giữ; thay đổi mới chỉ lưu trong phiên này." }; }
}
function getSnapshot() {
  if (!initialized && typeof window !== "undefined") { initialized = true; load(); }
  return snapshot;
}
function emit() { listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === CUSTOM_STORAGE_KEY || event.key === null) { load(); emit(); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useCustomVocabulary() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initial);
  function update(change: (data: CustomVocabulary) => CustomVocabulary) {
    let current = snapshot.data;
    if (!snapshot.error) {
      try { current = parseCustomVocabulary(localStorage.getItem(CUSTOM_STORAGE_KEY)); }
      catch { throw new Error("Bộ thẻ trên thiết bị đã thay đổi hoặc không đọc được. Hãy tải lại trang trước khi sửa."); }
    }
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
