"use client";
import { useEffect, useRef, useState } from "react";

export function AIExample() {
  const [level, setLevel] = useState("A1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function generate() {
    const form = button.current?.closest("form");
    if (!form) return;
    const values = new FormData(form);
    const german = String(values.get("german") ?? "").trim();
    const meaning = String(values.get("vietnamese") ?? "").trim();
    if (!german || !meaning) { setError("Nhập từ tiếng Đức và nghĩa tiếng Việt trước khi tạo ví dụ."); return; }
    const article = String(values.get("article") ?? "");
    const word = article && !/^(der|die|das)\s+/i.test(german) ? `${article} ${german}` : german;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/deutsch-ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ word, meaning_vi: meaning, level }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.example !== "string" || typeof data?.translation !== "string")
        throw new Error(data?.error || "Không tạo được câu ví dụ.");
      if (controller.signal.aborted) return;
      const exampleField = form.elements.namedItem("example") as HTMLTextAreaElement | null;
      const translationField = form.elements.namedItem("translation") as HTMLTextAreaElement | null;
      if (exampleField) exampleField.value = data.example;
      if (translationField) translationField.value = data.translation;
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tạo được câu ví dụ.");
    } finally { if (pending.current === controller) setBusy(false); }
  }

  return <div className="mt-4 space-y-3"><div className="flex flex-wrap items-center gap-3"><label className="text-sm">Trình độ <select className="border-2 border-[#29392a] bg-[#fffdf5] p-2" value={level} disabled={busy} onChange={event => setLevel(event.target.value)}>{["A1", "A2", "B1", "B2", "C1", "C2"].map(item => <option key={item}>{item}</option>)}</select></label><button ref={button} type="button" disabled={busy} aria-busy={busy} className="pixel-button bg-[#f8dda7]" onClick={() => void generate()}>{busy ? "Đang tạo ví dụ…" : "Tạo câu ví dụ AI"}</button></div><p className="text-sm text-[#647059]">Ví dụ AI sẽ điền vào hai ô trên; bạn có thể sửa trước khi lưu.</p>{error && <p role="alert" className="text-sm text-[#80421e]">{error}</p>}</div>;
}
