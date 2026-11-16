"use client";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/games";
import { exerciseNames, type ExerciseMode, type ExerciseQuestion } from "@/lib/exercises";
import type { Word } from "@/lib/vocabulary";

export function AIExerciseBuilder({ words, ready, onStart }: { words: Word[]; ready: boolean; onStart: (questions: ExerciseQuestion[], mode: ExerciseMode) => void }) {
  const [mode, setMode] = useState<ExerciseMode>("gap");
  const [level, setLevel] = useState("A1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => { pending.current?.abort(); pending.current = null; }, []);
  const pool = words.filter(word => mode !== "article" || word.article);
  async function generate() {
    if (busy || !ready || !pool.length) return;
    const controller = new AbortController(); pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 110000);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/deutsch-ai/exercises", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ wordIds: shuffle(pool).slice(0, 5).map(word => word.id), mode, level }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data?.questions) || !data.questions.length) throw new Error(data?.error || "Không tạo được bài tập AI. Hãy thử lại.");
      if (!controller.signal.aborted) onStart(data.questions, mode);
    } catch (error) {
      if (pending.current === controller && !controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tạo được bài tập AI.");
      else if (pending.current === controller) setError("Tạo bài tập quá lâu. Hãy thử lại.");
    } finally { clearTimeout(timeout); if (pending.current === controller) setBusy(false); }
  }
  function cancel() { pending.current?.abort(); pending.current = null; setBusy(false); setError(""); }
  return <section aria-labelledby="ai-exercise-title" className="pixel-panel my-7 bg-[#edf2e4] p-6"><p className="eyebrow">QWEN AI</p><h2 id="ai-exercise-title" className="mt-3 text-2xl">Tạo bài tập bằng AI</h2><p className="my-4 text-sm text-[#52604a]">Tạo tối đa 5 câu với ví dụ Đức–Việt mới từ chủ đề và các từ cần ôn bạn chọn bên dưới. Đáp án từ vựng và mạo từ dựa trên bộ thẻ của bạn.</p><div className="flex flex-wrap items-end gap-4"><label className="text-sm">Dạng bài<select disabled={busy} className="mt-2 block border-2 border-[#29392a] bg-[#fffdf5] p-3" value={mode} onChange={event => { setMode(event.target.value as ExerciseMode); setError(""); }}>{(["gap", "article", "translate"] as ExerciseMode[]).map(value => <option key={value} value={value}>{exerciseNames[value]}</option>)}</select></label><label className="text-sm">Trình độ<select disabled={busy} className="mt-2 block border-2 border-[#29392a] bg-[#fffdf5] p-3" value={level} onChange={event => setLevel(event.target.value)}>{["A1", "A2", "B1", "B2", "C1", "C2"].map(value => <option key={value}>{value}</option>)}</select></label><button type="button" className="pixel-button bg-[#f9cd65]" disabled={!ready || busy || !pool.length} aria-busy={busy} onClick={() => void generate()}>{busy ? "Đang tạo bài tập…" : "Tạo bài tập AI"}</button>{busy && <button type="button" className="pixel-button bg-[#fffdf5]" onClick={cancel}>Hủy tạo</button>}</div><p role="status" className="mt-4 text-sm text-[#647059]">{busy ? "Qwen đang soạn câu hỏi, có thể mất khoảng 100 giây." : ready ? `${pool.length} từ phù hợp${!pool.length ? ". Hãy đổi bộ lọc hoặc thêm từ và mạo từ." : "."}` : "Đang tải từ vựng…"}</p>{error && <p role="alert" className="mt-3 text-sm text-[#80421e]">{error}</p>}</section>;
}
