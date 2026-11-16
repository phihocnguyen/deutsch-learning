"use client";
import { useEffect, useRef, useState } from "react";
let stopCurrent: (() => void) | undefined;

export function Pronunciation({ id, text, sentence = false, label }: { id: string; text: string; sentence?: boolean; label?: string }) {
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const stopRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { stopRef.current?.(); }, [id, text]);
  async function play() {
    stopCurrent?.(); setMessage(""); setPlaying(true); setLoading(true);
    let active = true;
    let audio: HTMLAudioElement | undefined;
    let url: string | undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => { if (active) { stop(); setMessage("Tải giọng đọc quá lâu. Hãy thử lại."); } }, 65000);
    const stop = () => {
      if (!active) return;
      active = false; controller.abort(); clearTimeout(timeout);
      if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); audio.removeAttribute("src"); audio.load(); }
      if (url) URL.revokeObjectURL(url);
      setPlaying(false); setLoading(false);
      if (stopCurrent === stop) stopCurrent = undefined;
    };
    stopRef.current = stop; stopCurrent = stop;
    try {
      const response = await fetch("/api/deutsch-ai/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: controller.signal });
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error || "Không tải được giọng đọc."); }
      const blob = await response.blob();
      if (!active) return;
      clearTimeout(timeout); url = URL.createObjectURL(blob); audio = new Audio(url);
      audio.onended = stop;
      audio.onerror = () => { if (active) { stop(); setMessage("Không phát được âm thanh. Hãy thử lại."); } };
      setLoading(false); await audio.play();
    } catch (error) { if (active) { stop(); setMessage(error instanceof Error ? error.message : "Không tải được giọng đọc."); } }
  }
  return <div className="space-y-3"><button type="button" className="pixel-button bg-[#e1e9d4]" onClick={() => playing ? stopRef.current?.() : void play()} aria-busy={loading} aria-label={`${playing ? "Dừng" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")} ${text}`}>{loading ? "Đang tải giọng…" : playing ? "Dừng phát" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")}</button><p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p></div>;
}
