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
    let utterance: SpeechSynthesisUtterance | undefined;
    const stop = () => {
      if (!active) return;
      active = false;
      if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
        window.speechSynthesis.cancel();
      }
      setPlaying(false);
      if (stopCurrent === stop) stopCurrent = undefined;
    };
    stopRef.current = stop;
    stopCurrent = stop;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      stop();
      setMessage("Trình duyệt không hỗ trợ giọng nói.");
      return;
    }
    try {
      utterance = new SpeechSynthesisUtterance(text);
      // Let Chrome select its German voice, as in the original browser speech flow.
      utterance.lang = "de-DE";
      utterance.rate = .85;
      utterance.onend = stop;
      utterance.onerror = event => {
        if (!active) return;
        stop();
        setMessage(event.error ? `Trình duyệt không phát được giọng Đức (${event.error}).` : "Trình duyệt không phát được giọng Đức.");
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      stop();
      setMessage("Không phát được giọng Đức. Hãy thử lại.");
    }
  }

  return <div className={compact ? "min-w-0" : "space-y-3"}>
    <button type="button" className={compact ? "inline-flex min-h-10 items-center gap-2 border-2 border-[#29392a] bg-[#e1e9d4] px-3 text-sm shadow-[2px_2px_0_#29392a]" : "pixel-button bg-[#e1e9d4]"} onClick={() => playing ? stopRef.current?.() : play()} aria-label={`${playing ? "Dừng" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")} ${text}`}><span aria-hidden="true">{playing ? "■" : "♪"}</span>{playing ? "Dừng phát" : label ?? (sentence ? "Nghe câu ví dụ" : "Nghe từ")}</button>
    {message && <p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p>}
  </div>;
}
