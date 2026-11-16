"use client";
import { useEffect, useRef, useState } from "react";
let stopCurrent: (() => void) | undefined;

export function Pronunciation({ id, text, sentence = false, label }: { id: string; text: string; sentence?: boolean; label?: string }) {
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { stopRef.current?.(); }, [id, text]);

  function play() {
    stopCurrent?.();
    setMessage("");
    setPlaying(true);
    let active = true;
    const speech: { utterance?: SpeechSynthesisUtterance } = {};
    const stop = () => {
      if (!active) return;
      active = false;
      if (speech.utterance) { speech.utterance.onend = null; speech.utterance.onerror = null; window.speechSynthesis.cancel(); }
      setPlaying(false);
      if (stopCurrent === stop) stopCurrent = undefined;
    };
    stopRef.current = stop;
    stopCurrent = stop;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") { stop(); setMessage("Trình duyệt không hỗ trợ giọng tổng hợp."); return; }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      speech.utterance = utterance;
      utterance.lang = "de-DE";
      utterance.rate = .85;
      utterance.onend = stop;
      utterance.onerror = () => { if (active) { stop(); setMessage("Trình duyệt không phát được giọng nói. Hãy kiểm tra cài đặt giọng nói trên thiết bị."); } };
      window.speechSynthesis.speak(utterance);
    } catch { stop(); setMessage("Không phát được giọng tổng hợp. Hãy thử lại."); }
  }
  return <div className="space-y-3">
    <button type="button" className="pixel-button bg-[#e1e9d4]" onClick={() => playing ? stopRef.current?.() : play()} aria-label={`${playing ? "Dừng" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")} ${text}`}><span aria-hidden="true">{playing ? "■" : "♪"}</span>{playing ? "Dừng phát" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")}</button>
    <p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p>
  </div>;
}
