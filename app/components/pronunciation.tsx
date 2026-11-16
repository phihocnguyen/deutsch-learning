"use client";
import { useEffect, useRef, useState } from "react";
import audioManifest from "@/lib/audio-manifest.json";

type Recording = { src: string; author: string; source: string; license: string; licenseUrl: string; speaker: string };
export const recordings: Record<string, Recording> = audioManifest;
let stopCurrent: (() => void) | undefined;

export function Pronunciation({ id, text, sentence = false }: { id: string; text: string; sentence?: boolean }) {
  const recording = sentence ? undefined : recordings[id];
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [usingSynthetic, setUsingSynthetic] = useState(!recording);
  const stopRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { stopRef.current?.(); }, [id, text]);

  function play(synthetic = false) {
    stopCurrent?.();
    setUsingSynthetic(!recording || synthetic);
    setMessage("");
    setPlaying(true);
    let active = true;
    let player: HTMLAudioElement | undefined;
    const speech: { utterance?: SpeechSynthesisUtterance } = {};
    const stop = () => {
      if (!active) return;
      active = false;
      if (player) { player.pause(); player.onended = null; player.onerror = null; }
      if (speech.utterance) { speech.utterance.onend = null; speech.utterance.onerror = null; window.speechSynthesis.cancel(); }
      setPlaying(false);
      if (stopCurrent === stop) stopCurrent = undefined;
    };
    stopRef.current = stop;
    stopCurrent = stop;
    if (recording && !synthetic) {
      player = new Audio(recording.src);
      const failed = () => { if (active) { stop(); setMessage("Không phát được bản thu. Bạn có thể thử giọng tổng hợp."); } };
      player.onended = stop;
      player.onerror = failed;
      player.play().catch(failed);
      return;
    }
    if (!("speechSynthesis" in window)) { stop(); setMessage("Trình duyệt không hỗ trợ giọng tổng hợp."); return; }
    const voice = window.speechSynthesis.getVoices().find(v => /^de[-_]DE$/i.test(v.lang))
      ?? window.speechSynthesis.getVoices().find(v => /^de[-_]/i.test(v.lang));
    if (!voice) {
      // Trigger voice discovery; the next user click may find asynchronously loaded voices.
      window.speechSynthesis.getVoices();
      stop(); setMessage("Chưa có giọng Đức. Hãy cài giọng tiếng Đức trên thiết bị hoặc thử lại sau khi giọng được tải."); return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speech.utterance = utterance;
    utterance.lang = "de-DE"; utterance.voice = voice; utterance.rate = .85;
    utterance.onend = stop;
    utterance.onerror = () => { if (active) { stop(); setMessage("Không phát được giọng tổng hợp. Hãy thử lại."); } };
    try { window.speechSynthesis.speak(utterance); } catch { stop(); setMessage("Không phát được giọng tổng hợp."); }
  }
  return <div className="space-y-3">
    <button type="button" className="pixel-button bg-[#e1e9d4]" onClick={() => playing ? stopRef.current?.() : play()} aria-label={`${playing ? "Dừng" : "Nghe"} ${sentence ? "câu ví dụ" : "từ"} ${text}`}><span aria-hidden="true">{playing ? "■" : "♪"}</span>{playing ? "Dừng phát" : sentence ? "Nghe câu ví dụ" : "Nghe từ"}</button>
    <p className="text-xs leading-5 text-[#59644f]">{usingSynthetic ? "Giọng tổng hợp tiếng Đức · phụ thuộc thiết bị" : "Bản thu người Đức bản xứ · chỉ đọc từ"}</p>
    {recording && <details className="text-xs leading-6 text-[#59644f]"><summary className="cursor-pointer underline">Nguồn & giấy phép audio</summary><p>{recording.author} · {recording.speaker}.</p><a className="underline" href={recording.source} target="_blank" rel="noreferrer">Wikimedia Commons</a>{" · "}<a className="underline" href={recording.licenseUrl} target="_blank" rel="noreferrer">{recording.license}</a><p>File gốc, không chỉnh sửa.</p><button type="button" className="underline" onClick={() => play(true)}>Dùng giọng tổng hợp thay thế</button></details>}
    <p role="status" className="max-w-lg text-sm text-[#80421e]">{message}</p>
  </div>;
}
