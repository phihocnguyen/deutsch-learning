"use client";
import { useEffect, useRef, useState } from "react";
let stopCurrent: (() => void) | undefined;

export function Pronunciation({ id, text, sentence = false, label, compact = false }: { id: string; text: string; sentence?: boolean; label?: string; compact?: boolean }) {
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
    function speak(useBrowserDefault = false) {
      const utterance = new SpeechSynthesisUtterance(text);
      speech.utterance = utterance;
      if (useBrowserDefault) {
        const defaultVoice = window.speechSynthesis.getVoices().find(voice => voice.default);
        if (defaultVoice) { utterance.voice = defaultVoice; utterance.lang = defaultVoice.lang; }
      } else utterance.lang = "de-DE";
      utterance.rate = .85;
      utterance.onend = stop;
      utterance.onerror = event => {
        if (!active) return;
        if (!useBrowserDefault && (!event.error || ["language-unavailable", "voice-unavailable", "synthesis-failed"].includes(event.error))) {
          setMessage("Đang dùng giọng mặc định của trình duyệt; cách phát âm tiếng Đức có thể không chuẩn.");
          try { speak(true); }
          catch { stop(); setMessage("Trình duyệt không phát được giọng nói."); }
          return;
        }
        stop();
        setMessage(event.error ? `Trình duyệt không phát được giọng nói (${event.error}).` : "Trình duyệt không phát được giọng nói.");
      };
      window.speechSynthesis.speak(utterance);
    }
    try { speak(); }
    catch { stop(); setMessage("Không phát được giọng tổng hợp. Hãy thử lại."); }
  }
  return <div className={compact ? "min-w-0" : "space-y-3"}>
    <button type="button" className={compact ? "inline-flex min-h-10 items-center gap-2 border-2 border-[#29392a] bg-[#e1e9d4] px-3 text-sm shadow-[2px_2px_0_#29392a]" : "pixel-button bg-[#e1e9d4]"} onClick={() => playing ? stopRef.current?.() : play()} aria-label={`${playing ? "Dừng" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")} ${text}`}><span aria-hidden="true">{playing ? "■" : "♪"}</span>{playing ? "Dừng phát" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")}</button>
    {message && <p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p>}
  </div>;
}
