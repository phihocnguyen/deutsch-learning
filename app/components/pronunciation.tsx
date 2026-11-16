"use client";
import { useEffect, useRef, useState } from "react";
import { waitForGermanVoice } from "@/lib/speech";
let stopCurrent: (() => void) | undefined;

export function Pronunciation({ id, text, sentence = false, label }: { id: string; text: string; sentence?: boolean; label?: string }) {
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const stopRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { stopRef.current?.(); }, [id, text]);

  async function play() {
    stopCurrent?.();
    setMessage("");
    setPlaying(true);
    setLoading(true);
    let active = true;
    const controller = new AbortController();
    const speech: { utterance?: SpeechSynthesisUtterance } = {};
    const stop = () => {
      if (!active) return;
      active = false;
      controller.abort();
      if (speech.utterance) { speech.utterance.onend = null; speech.utterance.onerror = null; window.speechSynthesis.cancel(); }
      setPlaying(false);
      setLoading(false);
      if (stopCurrent === stop) stopCurrent = undefined;
    };
    stopRef.current = stop;
    stopCurrent = stop;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") { stop(); setMessage("Trình duyệt không hỗ trợ giọng tổng hợp."); return; }
    let voice: SpeechSynthesisVoice | null;
    try { voice = await waitForGermanVoice(window.speechSynthesis, controller.signal); }
    catch { if (active) { stop(); setMessage("Không tải được giọng đọc. Hãy thử lại."); } return; }
    if (!active) return;
    if (!voice) {
      stop(); setMessage("Chưa tìm thấy giọng Đức sau khi chờ tải. Bạn có thể thử lại hoặc cài giọng tiếng Đức trên thiết bị."); return;
    }
    setLoading(false);
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      speech.utterance = utterance;
      utterance.lang = voice.lang; utterance.voice = voice; utterance.rate = .85;
      utterance.onend = stop;
      utterance.onerror = () => { if (active) { stop(); setMessage("Không phát được giọng tổng hợp. Hãy thử lại."); } };
      window.speechSynthesis.speak(utterance);
    } catch { stop(); setMessage("Không phát được giọng tổng hợp. Hãy thử lại."); }
  }
  return <div className="space-y-3">
    <button type="button" className="pixel-button bg-[#e1e9d4]" onClick={() => playing ? stopRef.current?.() : void play()} aria-busy={loading} aria-label={`${playing ? "Dừng" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")} ${text}`}><span aria-hidden="true">{loading ? "◌" : playing ? "■" : "♪"}</span>{loading ? "Đang tải giọng…" : playing ? "Dừng phát" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")}</button>
    <p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p>
  </div>;
}
