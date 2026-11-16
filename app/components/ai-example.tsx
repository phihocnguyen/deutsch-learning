"use client";
import { useEffect, useRef, useState } from "react";
import { fullWord, type Word } from "@/lib/vocabulary";

export function AIExample({ word }: { word: Word }) {
  const [level, setLevel] = useState("A1");
  const [result, setResult] = useState<{ example: string; translation: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  async function generate() {
    const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/deutsch-ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word: fullWord(word), meaning_vi: word.vietnamese, level }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không tạo được câu ví dụ.");
      setResult(data);
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tạo được câu ví dụ."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  return <div className="my-5 space-y-3"><div className="flex flex-wrap items-center gap-3"><label className="text-sm">Trình độ <select className="border-2 border-[#29392a] bg-[#fffdf5] p-2" value={level} disabled={busy} onChange={e => setLevel(e.target.value)}>{["A1", "A2", "B1", "B2", "C1", "C2"].map(item => <option key={item}>{item}</option>)}</select></label><button type="button" disabled={busy} aria-busy={busy} className="pixel-button bg-[#f8dda7]" onClick={() => void generate()}>{busy ? "Đang tạo ví dụ…" : "Tạo câu ví dụ AI"}</button></div>{result && <div className="border-l-4 border-[#96a87f] pl-4" role="status"><p lang="de">{result.example}</p><p className="mt-2 text-sm text-[#647059]">{result.translation}</p></div>}{error && <p role="alert" className="text-sm text-[#80421e]">{error}</p>}</div>;
}
